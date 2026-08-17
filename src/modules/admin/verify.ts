// 草稿对齐校验核心逻辑(确定性字符串比对,无 LLM)
// 网页按钮(server action)和 CLI 脚本(prisma/verify-drafts.ts)共用本模块
// 数据来源:① 每条项目的 sourceUrl 官网简章页(剥标签取纯文本)
//          ② prisma/data/attachments/<slug>*.txt 本地附件文本
// 报告写入 prisma/data/verify-report.json,审核页读取展示徽章
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { prisma } from "@/shared/db";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// 归一化:去全部空白和标点差异,专治 PDF 提取的断行/全角半角
const norm = (s: string) =>
  s.replace(/[\s,,\u3000«()()/·-]/g, "").toLowerCase();

async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
  } catch {
    return "";
  }
}

type Check = { ok: boolean; note?: string };

function checkName(nameZh: string, text: string): Check {
  // 去掉我们加的"(英文授课)"等后缀再比对
  const core = nameZh.replace(/[((].*$/, "");
  return norm(text).includes(norm(core))
    ? { ok: true }
    : { ok: false, note: `「${core}」未在来源文本中找到` };
}

function checkTuition(tuition: number | null, text: string): Check {
  if (tuition == null) return { ok: true, note: "留空(未知)" };
  const variants = [String(tuition), tuition.toLocaleString("en-US")];
  return variants.some((v) => text.includes(v))
    ? { ok: true }
    : { ok: false, note: `学费 ${tuition} 未在来源文本中找到` };
}

function checkDeadline(deadline: Date | null, text: string): Check {
  if (!deadline) return { ok: true, note: "留空" };
  // 日期按 UTC 中午存,用 UTC 取日历日,任何时区都正确
  const y = deadline.getUTCFullYear();
  const m = deadline.getUTCMonth() + 1;
  const d = deadline.getUTCDate();
  const variants = [
    `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    `${y}年${m}月${d}日`,
  ];
  return variants.some((v) => text.includes(v))
    ? { ok: true }
    : { ok: false, note: `截止日 ${y}-${m}-${d} 未在来源文本中找到` };
}

function checkLanguage(langs: string[], text: string): Check {
  if (langs.length === 0) return { ok: false, note: "授课语言为空" };
  for (const l of langs) {
    if (l === "english" && !/英文|英语|English/i.test(text))
      return { ok: false, note: "来源未见英文授课表述" };
    if (l === "chinese" && !/中文|汉语|Chinese/i.test(text))
      return { ok: false, note: "来源未见中文授课表述" };
  }
  return { ok: true };
}

export type VerifyReport = {
  generatedAt: string;
  programs: {
    id: string;
    universitySlug: string;
    nameZh: string;
    checks: Record<string, Check>;
  }[];
  universities: {
    id: string;
    nameZh: string;
    checks: Record<string, Check>;
  }[];
};

export async function runVerifyDrafts(): Promise<VerifyReport> {
  const [draftPrograms, draftUniversities] = await Promise.all([
    prisma.program.findMany({
      where: { dataStatus: "DRAFT" },
      include: { university: { select: { slug: true } } },
    }),
    prisma.university.findMany({ where: { dataStatus: "DRAFT" } }),
  ]);

  const pageCache = new Map<string, string>();
  const getPage = async (url: string) => {
    if (!pageCache.has(url)) pageCache.set(url, await fetchPageText(url));
    return pageCache.get(url) ?? "";
  };
  const attachDir = path.join(process.cwd(), "prisma", "data", "attachments");
  const attachFiles = existsSync(attachDir) ? readdirSync(attachDir) : [];

  const report: VerifyReport = {
    generatedAt: new Date().toISOString(),
    programs: [],
    universities: [],
  };

  // 学校:校名/城市应出现在官网首页,官网应可达
  // (简介/俄文名/优势学科是 LLM 生成,无原文可对,不纳入校验)
  for (const u of draftUniversities) {
    const checks: Record<string, Check> = {};
    if (!u.website) {
      checks["官网"] = { ok: false, note: "未填官网" };
    } else {
      const text = await getPage(u.website);
      checks["官网可达"] = text
        ? { ok: true }
        : { ok: false, note: "官网打不开(可能反爬,人工确认)" };
      checks["校名"] = norm(text).includes(norm(u.nameZh))
        ? { ok: true }
        : { ok: false, note: "官网首页未见校名" };
      checks["城市"] = norm(text).includes(norm(u.city))
        ? { ok: true }
        : { ok: false, note: "官网首页未见城市名(弱校验,可忽略)" };
    }
    report.universities.push({ id: u.id, nameZh: u.nameZh, checks });
  }

  for (const p of draftPrograms) {
    const slug = p.university.slug;

    const pageText = p.sourceUrl ? await getPage(p.sourceUrl) : "";
    const attachText = attachFiles
      .filter((f) => f.startsWith(slug) && f.endsWith(".txt"))
      .map((f) => readFileSync(path.join(attachDir, f), "utf-8"))
      .join("\n");
    const text = `${pageText}\n${attachText}`;

    report.programs.push({
      id: p.id,
      universitySlug: slug,
      nameZh: p.nameZh,
      checks: {
        专业名: checkName(p.nameZh, text),
        学费: checkTuition(p.tuitionPerYear, text),
        截止日: checkDeadline(p.applicationDeadline, text),
        授课语言: checkLanguage(p.teachingLanguages, text),
      },
    });
  }

  const outPath = path.join(process.cwd(), "prisma", "data", "verify-report.json");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  return report;
}
