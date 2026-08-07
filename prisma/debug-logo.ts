// 调试:打印指定学校首页的 <img> 候选,供人工挑选 logo
// 运行:pnpm tsx prisma/debug-logo.ts pku zju ...
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const SITES: Record<string, string> = {
  pku: "https://www.pku.edu.cn",
  zju: "https://www.zju.edu.cn",
  scut: "https://www.scut.edu.cn",
  scu: "https://www.scu.edu.cn",
  lzu: "https://www.lzu.edu.cn",
  ybu: "https://www.ybu.edu.cn",
  bisu: "https://www.bisu.edu.cn",
  ustc: "https://www.ustc.edu.cn",
  uestc: "https://www.uestc.edu.cn",
  dlufl: "https://www.dlufl.edu.cn",
};

async function main() {
  for (const slug of process.argv.slice(2)) {
    const base = SITES[slug];
    if (!base) continue;
    console.log(`\n===== ${slug} ${base} =====`);
    try {
      const res = await fetch(base, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(20_000),
        redirect: "follow",
      });
      console.log("HTTP", res.status, res.url);
      const html = await res.text();
      const tags = html.match(/<img\b[^>]*>/gi) ?? [];
      tags.slice(0, 15).forEach((t) => console.log(" ", t.slice(0, 220)));
      // CSS 背景图里的 logo
      const bg = html.match(/url\(["']?([^"')]*logo[^"')]*)["']?\)/gi);
      if (bg) console.log(" CSS:", bg.slice(0, 5).join(" | "));
    } catch (e) {
      console.log(" FETCH FAIL", String(e).slice(0, 120));
    }
  }
}

main();
