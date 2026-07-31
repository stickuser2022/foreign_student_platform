// 种子数据:3 所学校 + 项目 + CSC 平台级奖学金(schema v2.1)
// 运行:pnpm prisma db seed 或 pnpm tsx prisma/seed.ts(需数据库已启动且 migrate 完成)
// 注意:项目用固定 id 单独 upsert,保证重复执行时字段(含新增字段)同步
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const hit = await prisma.university.upsert({
    where: { slug: "hit" },
    update: {
      dataStatus: "PUBLISHED",
      lastVerifiedAt: new Date(),
      universityType: "SCIENCE_ENGINEERING",
      strongDisciplines: ["焊接", "航天", "计算机科学与技术"],
    },
    create: {
      slug: "hit",
      nameZh: "哈尔滨工业大学",
      nameRu: "Харбинский политехнический университет",
      nameEn: "Harbin Institute of Technology",
      city: "哈尔滨",
      province: "黑龙江",
      website: "http://www.hit.edu.cn",
      is985: true,
      is211: true,
      isDoubleFirstClass: true,
      universityType: "SCIENCE_ENGINEERING",
      strongDisciplines: ["焊接", "航天", "计算机科学与技术"],
      livingCostPerMonth: 2500,
      dataStatus: "PUBLISHED",
      lastVerifiedAt: new Date(),
    },
  });

  const blcu = await prisma.university.upsert({
    where: { slug: "blcu" },
    update: {
      dataStatus: "PUBLISHED",
      lastVerifiedAt: new Date(),
      universityType: "LANGUAGE",
      strongDisciplines: ["汉语国际教育", "语言学"],
    },
    create: {
      slug: "blcu",
      nameZh: "北京语言大学",
      nameRu: "Пекинский университет языка и культуры",
      nameEn: "Beijing Language and Culture University",
      city: "北京",
      province: "北京",
      website: "http://www.blcu.edu.cn",
      universityType: "LANGUAGE",
      strongDisciplines: ["汉语国际教育", "语言学"],
      livingCostPerMonth: 4000,
      dataStatus: "PUBLISHED",
      lastVerifiedAt: new Date(),
    },
  });

  const sjtu = await prisma.university.upsert({
    where: { slug: "sjtu" },
    update: {
      dataStatus: "PUBLISHED",
      lastVerifiedAt: new Date(),
      universityType: "COMPREHENSIVE",
      strongDisciplines: ["临床医学", "船舶与海洋工程", "电子信息"],
    },
    create: {
      slug: "sjtu",
      nameZh: "上海交通大学",
      nameRu: "Шанхайский университет Цзяотун",
      nameEn: "Shanghai Jiao Tong University",
      city: "上海",
      province: "上海",
      website: "https://www.sjtu.edu.cn",
      is985: true,
      is211: true,
      isDoubleFirstClass: true,
      universityType: "COMPREHENSIVE",
      strongDisciplines: ["临床医学", "船舶与海洋工程", "电子信息"],
      livingCostPerMonth: 4500,
      dataStatus: "PUBLISHED",
      lastVerifiedAt: new Date(),
    },
  });

  const programs = [
    {
      id: "seed-hit-cs-bachelor",
      universityId: hit.id,
      nameZh: "计算机科学与技术(本科,英文授课)",
      nameRu: "Компьютерные науки и технологии (бакалавриат, англ.)",
      degreeLevel: "BACHELOR" as const,
      teachingLanguages: ["english"],
      durationYears: 4,
      tuitionPerYear: 26000,
      hostelFeePerYear: 9000,
      insuranceFeePerYear: 800,
      applicationFee: 400,
      scholarshipNote: "可申请 CSC 全额奖学金或校长奖学金(学费减免 50%)",
      intake: "2026 秋季",
    },
    {
      id: "seed-blcu-language-year",
      universityId: blcu.id,
      nameZh: "汉语进修(一年)",
      nameRu: "Годичные языковые курсы китайского языка",
      degreeLevel: "LANGUAGE" as const,
      teachingLanguages: ["chinese"],
      durationYears: 1,
      tuitionPerYear: 25000,
      hostelFeePerYear: 12000,
      insuranceFeePerYear: 800,
      scholarshipNote: "完成本课程并通过 HSK4 可申请本校本科项目",
      intake: "2026 秋季",
    },
    {
      id: "seed-sjtu-mbbs",
      universityId: sjtu.id,
      nameZh: "临床医学 MBBS(本科,英文授课)",
      nameRu: "Клиническая медицина MBBS (бакалавриат, англ.)",
      degreeLevel: "BACHELOR" as const,
      teachingLanguages: ["english"],
      durationYears: 6,
      tuitionPerYear: 48500,
      hostelFeePerYear: 15000,
      insuranceFeePerYear: 800,
      applicationFee: 800,
      scholarshipNote: "可申请 CSC;2026/2027 学年起需提供 CSCA 成绩",
      intake: "2026 秋季",
    },
  ];

  for (const p of programs) {
    await prisma.program.upsert({
      where: { id: p.id },
      update: { ...p, dataStatus: "PUBLISHED", lastVerifiedAt: new Date() },
      create: { ...p, dataStatus: "PUBLISHED", lastVerifiedAt: new Date() },
    });
  }

  await prisma.scholarship.upsert({
    where: { id: "csc-platform-level" },
    update: { dataStatus: "PUBLISHED", lastVerifiedAt: new Date() },
    create: {
      id: "csc-platform-level",
      name: "中国政府奖学金 (CSC)",
      type: "CSC",
      coverage: "学费 + 住宿 + 生活费 + 医疗保险",
      applicationChannel: "studyinchina.csc.edu.cn(Type A/B,需 Agency Number)",
      description: "中国政府全额奖学金,面向所有招收国际学生的中国高校。",
      sourceUrl: "https://www.campuschina.org/",
      dataStatus: "PUBLISHED",
      lastVerifiedAt: new Date(),
    },
  });

  console.log("Seed 完成:", { hit: hit.slug, blcu: blcu.slug, sjtu: sjtu.slug });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
