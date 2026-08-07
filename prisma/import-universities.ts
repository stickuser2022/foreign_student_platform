// 批量导入学校名单 CSV → 全部建为 DRAFT(走后台审核队列人工核查后发布)
// 已在库中的 slug 跳过不动(不碰已有学校的字段和状态)
// 运行:pnpm tsx prisma/import-universities.ts(需数据库已启动)
import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { UniversityType } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const CSV = path.join(__dirname, "data", "universities-batch1.csv");

async function main() {
  const lines = readFileSync(CSV, "utf-8").trim().split("\n");
  const rows = lines.slice(1); // 跳过表头

  let created = 0;
  let skipped = 0;

  for (const line of rows) {
    const [slug, nameZh, nameEn, city, province, universityType, is985, is211, isDoubleFirstClass, website] =
      line.split(",");

    const existing = await prisma.university.findUnique({ where: { slug } });
    if (existing) {
      console.log(`跳过(已存在):${slug} ${nameZh}`);
      skipped++;
      continue;
    }

    await prisma.university.create({
      data: {
        slug,
        nameZh,
        nameEn,
        city,
        province,
        universityType: universityType as UniversityType,
        is985: is985 === "true",
        is211: is211 === "true",
        isDoubleFirstClass: isDoubleFirstClass === "true",
        website,
        sourceUrl: website, // 基础事实信息的核查入口即官网
        dataStatus: "DRAFT",
      },
    });
    console.log(`导入:${slug} ${nameZh}`);
    created++;
  }

  console.log(`\n完成:导入 ${created} 所,跳过 ${skipped} 所`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
