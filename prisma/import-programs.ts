// 项目草稿批量导入:读 prisma/data/programs/<slug>.json,生成 DRAFT 项目
// 文件格式:{ universitySlug, common: {校级公共字段}, programs: [专业条目] }
// 幂等:同校同名同层次的 DRAFT 已存在则跳过,不重复建
// 运行:pnpm tsx prisma/import-programs.ts(需数据库已启动)
import "dotenv/config";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { DegreeLevel } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// "YYYY-MM-DD" 按 UTC 中午 12 点存,全球任何时区(±12h)读出都是同一天
export function parseDateOnly(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

type ProgramEntry = {
  nameZh: string;
  nameEn?: string;
  degreeLevel?: DegreeLevel;
  teachingLanguages: string[];
  durationYears?: number;
  tuitionPerYear?: number;
};

type SchoolFile = {
  universitySlug: string;
  common: {
    degreeLevel?: DegreeLevel;
    applicationFee?: number;
    applicationDeadline?: string;
    intake?: string;
    requirements?: string;
    scholarshipNote?: string;
    sourceUrl?: string;
  };
  programs: ProgramEntry[];
};

async function main() {
  const dir = path.join(__dirname, "data", "programs");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const data: SchoolFile = JSON.parse(readFileSync(path.join(dir, file), "utf-8"));
    const university = await prisma.university.findUnique({
      where: { slug: data.universitySlug },
    });
    if (!university) {
      console.log(`!! 学校不存在:${data.universitySlug}(${file})`);
      continue;
    }

    let created = 0;
    let skipped = 0;
    for (const p of data.programs) {
      const degreeLevel = p.degreeLevel ?? data.common.degreeLevel ?? "BACHELOR";
      const dup = await prisma.program.findFirst({
        where: {
          universityId: university.id,
          nameZh: p.nameZh,
          degreeLevel,
        },
      });
      if (dup) {
        skipped++;
        continue;
      }
      await prisma.program.create({
        data: {
          universityId: university.id,
          nameZh: p.nameZh,
          nameEn: p.nameEn ?? null,
          degreeLevel,
          teachingLanguages: p.teachingLanguages,
          durationYears: p.durationYears ?? null,
          tuitionPerYear: p.tuitionPerYear ?? null,
          applicationFee: data.common.applicationFee ?? null,
          applicationDeadline: data.common.applicationDeadline
            ? parseDateOnly(data.common.applicationDeadline)
            : null,
          intake: data.common.intake ?? null,
          requirements: data.common.requirements ?? null,
          scholarshipNote: data.common.scholarshipNote ?? null,
          sourceUrl: data.common.sourceUrl ?? null,
          dataStatus: "DRAFT",
        },
      });
      created++;
    }
    console.log(`${data.universitySlug}: 新建 ${created} 个草稿,跳过 ${skipped} 个已存在`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
