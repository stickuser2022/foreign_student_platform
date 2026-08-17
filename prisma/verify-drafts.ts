// 草稿对齐校验 CLI 入口(逻辑在 src/modules/admin/verify.ts,与网页按钮共用)
// 运行:pnpm verify(需数据库已启动)
import "dotenv/config";
import { runVerifyDrafts } from "../src/modules/admin/verify";

async function main() {
  const report = await runVerifyDrafts();
  const failed = report.programs.filter((p) =>
    Object.values(p.checks).some((c) => !c.ok)
  );
  console.log(
    `校验完成:${report.programs.length} 条,全绿 ${report.programs.length - failed.length} 条,有红 ${failed.length} 条`
  );
  for (const p of failed) {
    const reds = Object.entries(p.checks)
      .filter(([, c]) => !c.ok)
      .map(([f, c]) => `${f}: ${c.note ?? "×"}`)
      .join(" | ");
    console.log(`  ❌ ${p.universitySlug} / ${p.nameZh} → ${reds}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
