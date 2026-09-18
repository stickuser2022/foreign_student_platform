// 把人工(子代理)翻译结果写回 programs 表的俄文字段
// 运行:pnpm tsx prisma/apply-translations.ts
import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

type Item = { id: string; field: "nameRu" | "requirementsRu" | "scholarshipNoteRu"; ru: string };

async function main() {
  const items: Item[] = JSON.parse(
    readFileSync(path.join(__dirname, "data", "i18n-out", "all.json"), "utf-8")
  );
  let done = 0;
  for (const it of items) {
    await prisma.program.update({
      where: { id: it.id },
      data: { [it.field]: it.ru },
    });
    done++;
  }
  console.log(`写回 ${done} 条`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
