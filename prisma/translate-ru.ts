// 批量中→俄翻译(DeepSeek API):扫描"有中文、俄文为空"的字段,翻译后写回
// 纪律:数字/日期/HSK/CSCA/网址等事实内容原样保留,只翻描述性文字;翻完走人工复核
// 运行:pnpm translate            —— 全量
//      pnpm translate -- --limit 3 --dry   —— 试跑 3 条只打印不写库
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const KEY = process.env.DEEPSEEK_API_KEY;
if (!KEY) {
  console.error("缺少 DEEPSEEK_API_KEY(.env)");
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const LIMIT = (() => {
  const i = args.indexOf("--limit");
  return i >= 0 ? Number(args[i + 1]) : Infinity;
})();

async function translate(text: string): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          temperature: 0.1,
          messages: [
            {
              role: "system",
              content:
                "你是留学信息平台的专业中译俄翻译。规则:1) 只输出俄语译文,不要任何解释;2) 数字、日期、网址、HSK/CSCA/TOEFL/IELTS 等专有名词和分数要求原样保留;3) 语气客观简洁,面向俄罗斯学生;4) 中国大学专有名词用通行俄语译法或音译;5) 若输入是分号分隔的列表,逐项翻译并保留分号结构。",
            },
            { role: "user", content: text },
          ],
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`);
      const data = (await res.json()) as {
        choices: { message: { content: string } }[];
      };
      return data.choices[0].message.content.trim();
    } catch (e) {
      if (attempt === 3) throw e;
      console.log(`  (第 ${attempt} 次超时/失败,重试…)`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("unreachable");
}

type Job = {
  table: "program" | "scholarship" | "university";
  id: string;
  field: string;
  from: string;
  isList?: boolean;
};

async function collectJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const universities = await prisma.university.findMany();
  for (const u of universities) {
    if (!u.nameRu)
      jobs.push({ table: "university", id: u.id, field: "nameRu", from: u.nameZh });
    if (u.descriptionZh && !u.descriptionRu)
      jobs.push({ table: "university", id: u.id, field: "descriptionRu", from: u.descriptionZh });
    if (u.strongDisciplines.length > 0 && u.strongDisciplinesRu.length === 0)
      jobs.push({
        table: "university",
        id: u.id,
        field: "strongDisciplinesRu",
        from: u.strongDisciplines.join("; "),
        isList: true,
      });
  }
  const programs = await prisma.program.findMany();
  for (const p of programs) {
    if (!p.nameRu) jobs.push({ table: "program", id: p.id, field: "nameRu", from: p.nameZh });
    if (p.requirements && !p.requirementsRu)
      jobs.push({ table: "program", id: p.id, field: "requirementsRu", from: p.requirements });
    if (p.scholarshipNote && !p.scholarshipNoteRu)
      jobs.push({ table: "program", id: p.id, field: "scholarshipNoteRu", from: p.scholarshipNote });
  }
  const scholarships = await prisma.scholarship.findMany();
  for (const s of scholarships) {
    if (!s.nameRu) jobs.push({ table: "scholarship", id: s.id, field: "nameRu", from: s.name });
    if (s.coverage && !s.coverageRu)
      jobs.push({ table: "scholarship", id: s.id, field: "coverageRu", from: s.coverage });
    if (s.description && !s.descriptionRu)
      jobs.push({ table: "scholarship", id: s.id, field: "descriptionRu", from: s.description });
  }
  return jobs;
}

async function main() {
  const jobs = (await collectJobs()).slice(0, LIMIT);
  console.log(`待翻译 ${jobs.length} 个字段${DRY ? "(试跑不写库)" : ""}`);

  let done = 0;
  for (const j of jobs) {
    const ru = await translate(j.from);
    done++;
    if (DRY) {
      console.log(`\n[${j.table}.${j.field}] ${j.from.slice(0, 50)}`);
      console.log(`  → ${ru.slice(0, 120)}`);
      continue;
    }
    // 数组字段:按分号拆回数组
    const value = j.isList
      ? ru.split(/[;；]/).map((s) => s.trim()).filter(Boolean)
      : ru;
    const data = { [j.field]: value };
    if (j.table === "program") {
      await prisma.program.update({ where: { id: j.id }, data });
    } else if (j.table === "scholarship") {
      await prisma.scholarship.update({ where: { id: j.id }, data });
    } else {
      await prisma.university.update({ where: { id: j.id }, data });
    }
    console.log(`✓ ${done}/${jobs.length} ${j.table}.${j.field}`);
    await new Promise((r) => setTimeout(r, 200)); // 温柔限速
  }
  console.log(`\n完成:${done} 个字段`);

  // 覆盖率报告:已发布内容里还有谁缺俄文(前台零中文原则的兜底检查)
  console.log("\n--- 俄文覆盖率(已发布内容)---");
  const [pubU, pubP, pubS] = await Promise.all([
    prisma.university.findMany({ where: { dataStatus: "PUBLISHED" } }),
    prisma.program.findMany({ where: { dataStatus: "PUBLISHED" } }),
    prisma.scholarship.findMany({ where: { dataStatus: "PUBLISHED" } }),
  ]);
  const gaps: string[] = [];
  for (const u of pubU) {
    if (!u.nameRu) gaps.push(`学校 ${u.nameZh}: 缺俄文名`);
    if (u.descriptionZh && !u.descriptionRu) gaps.push(`学校 ${u.nameZh}: 缺俄文简介`);
    if (u.strongDisciplines.length > 0 && u.strongDisciplinesRu.length === 0)
      gaps.push(`学校 ${u.nameZh}: 缺优势学科俄文`);
  }
  for (const p of pubP) {
    if (!p.nameRu) gaps.push(`项目 ${p.nameZh}: 缺俄文名`);
    if (p.requirements && !p.requirementsRu) gaps.push(`项目 ${p.nameZh}: 缺申请要求俄文`);
    if (p.scholarshipNote && !p.scholarshipNoteRu)
      gaps.push(`项目 ${p.nameZh}: 缺奖学金说明俄文`);
  }
  for (const s of pubS) {
    if (!s.nameRu) gaps.push(`奖学金 ${s.name}: 缺俄文名`);
    if (s.coverage && !s.coverageRu) gaps.push(`奖学金 ${s.name}: 缺覆盖范围俄文`);
  }
  if (gaps.length === 0) {
    console.log("✓ 已发布内容俄文覆盖 100%,无遗漏");
  } else {
    console.log(`发现 ${gaps.length} 处缺口:`);
    gaps.forEach((g) => console.log("  - " + g));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
