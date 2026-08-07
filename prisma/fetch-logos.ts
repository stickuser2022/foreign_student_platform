// Logo 抓取:访问学校官网首页,按 HTML 结构规律(文件名/class 含 logo、位置靠顶部)
// 找候选图,下载存 public/uploads/,把本地路径写进 DRAFT 记录的 logoUrl
// 已有 logoUrl 的学校跳过;抓不到的列入失败报告人工处理
// 运行:pnpm tsx prisma/fetch-logos.ts(需数据库已启动)
import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(15_000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    // 只关心 <img> 标签(ASCII),乱码不影响
    return await res.text();
  } catch {
    return null;
  }
}

// 从首页 HTML 中找最像 logo 的图片 URL
function pickLogoUrl(html: string, base: string): string | null {
  const tags = html.match(/<img\b[^>]*>/gi) ?? [];
  let best: { url: string; score: number } | null = null;

  for (const [idx, tag] of tags.entries()) {
    const src = /(?:src|data-src|data-original)=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!src || src.startsWith("data:")) continue;
    let url: URL;
    try {
      url = new URL(src, base);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(url.protocol)) continue;

    const alt = /alt=["']([^"']*)["']/i.exec(tag)?.[1] ?? "";
    const cls = /class=["']([^"']*)["']/i.exec(tag)?.[1] ?? "";
    const id = /id=["']([^"']*)["']/i.exec(tag)?.[1] ?? "";
    const hay = `${src} ${alt} ${cls} ${id}`;

    let score = 0;
    if (/logo/i.test(src)) score += 6;
    if (/logo/i.test(`${alt} ${cls} ${id}`)) score += 4;
    if (/\.(png|svg)(\?|$)/i.test(src)) score += 1;
    if (/banner|slide|ad|wx|qrcode|search/i.test(hay)) score -= 5;
    // 位置越靠顶部越可能是 logo
    score += (1 - idx / Math.max(tags.length, 1)) * 2;

    if (score > 2 && (!best || score > best.score)) {
      best = { url: url.toString(), score };
    }
  }

  return best ? best.url : null;
}

async function download(url: string, destBase: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Referer: new URL(url).origin },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500 || buf.length > 2 * 1024 * 1024) return null;
    const ext = type.includes("svg")
      ? ".svg"
      : type.includes("png")
        ? ".png"
        : type.includes("gif")
          ? ".gif"
          : ".jpg";
    const file = `${destBase}${ext}`;
    writeFileSync(path.join(process.cwd(), "public", "uploads", file), buf);
    return `/uploads/${file}`;
  } catch {
    return null;
  }
}

async function processOne(slug: string, website: string) {
  const u = await prisma.university.findUnique({ where: { slug } });
  if (!u || u.dataStatus !== "DRAFT") return `${slug}: 跳过(不存在或已发布)`;
  if (u.logoUrl) return `${slug}: 跳过(已有 logo)`;

  const html = await fetchText(website);
  if (!html) return `${slug}: 失败(首页打不开)`;

  const logoUrl = pickLogoUrl(html, website);
  if (!logoUrl) return `${slug}: 失败(没找到 logo 候选)`;

  const local = await download(logoUrl, `logo-${slug}`);
  if (!local) return `${slug}: 失败(图片下载不了 ${logoUrl})`;

  await prisma.university.update({
    where: { slug },
    data: { logoUrl: local },
  });
  return `${slug}: OK ${local}  <- ${logoUrl}`;
}

async function main() {
  mkdirSync(path.join(process.cwd(), "public", "uploads"), { recursive: true });

  const lines = readFileSync(
    path.join(__dirname, "data", "universities-batch1.csv"),
    "utf-8"
  )
    .trim()
    .split("\n")
    .slice(1);
  const schools = lines.map((l) => {
    const [slug, , , , , , , , , website] = l.split(",");
    return { slug, website };
  });

  // 8 个一组并发,避免打爆对方服务器
  for (let i = 0; i < schools.length; i += 8) {
    const chunk = schools.slice(i, i + 8);
    const results = await Promise.all(
      chunk.map((s) => processOne(s.slug, s.website))
    );
    results.forEach((r) => console.log(r));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
