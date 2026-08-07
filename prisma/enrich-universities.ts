// 富字段导入:把 LLM 生成的俄文名/中俄简介/优势学科更新进待审核学校
// 只更新 dataStatus=DRAFT 的记录,已发布的不碰;字段为空的草稿会被填充
// 运行:pnpm tsx prisma/enrich-universities.ts(需数据库已启动)
import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

type Enrich = {
  slug: string;
  nameRu: string;
  descriptionZh: string;
  descriptionRu: string;
  strongDisciplines: string[];
};

async function main() {
  const dir = path.join(__dirname, "data", "enrich");
  const all: Enrich[] = [1, 2, 3].flatMap((n) =>
    JSON.parse(readFileSync(path.join(dir, `part-${n}.json`), "utf-8"))
  );

  let updated = 0;
  let skipped = 0;

  for (const e of all) {
    const u = await prisma.university.findUnique({ where: { slug: e.slug } });
    if (!u || u.dataStatus !== "DRAFT") {
      console.log(`跳过(不存在或已发布):${e.slug}`);
      skipped++;
      continue;
    }
    await prisma.university.update({
      where: { slug: e.slug },
      data: {
        nameRu: e.nameRu,
        descriptionZh: e.descriptionZh,
        descriptionRu: e.descriptionRu,
        strongDisciplines: e.strongDisciplines,
      },
    });
    updated++;
  }

  console.log(`\n完成:更新 ${updated} 所,跳过 ${skipped} 所`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
