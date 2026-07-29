// 种子数据:3 所学校 + 项目 + CSC 平台级奖学金
// 运行:pnpm prisma db seed 或 pnpm tsx prisma/seed.ts(需数据库已启动且 migrate 完成)
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
    update: {},
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
      programs: {
        create: [
          {
            nameZh: "计算机科学与技术(本科,英文授课)",
            nameRu: "Компьютерные науки и технологии (бакалавриат, англ.)",
            degreeLevel: "BACHELOR",
            teachingLanguages: ["english"],
            durationYears: 4,
            tuitionPerYear: 26000,
            applicationFee: 400,
            intake: "2026 秋季",
          },
        ],
      },
    },
  });

  const blcu = await prisma.university.upsert({
    where: { slug: "blcu" },
    update: {},
    create: {
      slug: "blcu",
      nameZh: "北京语言大学",
      nameRu: "Пекинский университет языка и культуры",
      nameEn: "Beijing Language and Culture University",
      city: "北京",
      province: "北京",
      website: "http://www.blcu.edu.cn",
      programs: {
        create: [
          {
            nameZh: "汉语进修(一年)",
            nameRu: "Годичные языковые курсы китайского языка",
            degreeLevel: "LANGUAGE",
            teachingLanguages: ["chinese"],
            durationYears: 1,
            tuitionPerYear: 25000,
            intake: "2026 秋季",
          },
        ],
      },
    },
  });

  const sjtu = await prisma.university.upsert({
    where: { slug: "sjtu" },
    update: {},
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
      programs: {
        create: [
          {
            nameZh: "临床医学 MBBS(本科,英文授课)",
            nameRu: "Клиническая медицина MBBS (бакалавриат, англ.)",
            degreeLevel: "BACHELOR",
            teachingLanguages: ["english"],
            durationYears: 6,
            tuitionPerYear: 48500,
            applicationFee: 800,
            intake: "2026 秋季",
          },
        ],
      },
    },
  });

  await prisma.scholarship.upsert({
    where: { id: "csc-platform-level" },
    update: {},
    create: {
      id: "csc-platform-level",
      name: "中国政府奖学金 (CSC)",
      type: "CSC",
      coverage: "学费 + 住宿 + 生活费 + 医疗保险",
      applicationChannel: "studyinchina.csc.edu.cn(Type A/B,需 Agency Number)",
      description: "中国政府全额奖学金,面向所有招收国际学生的中国高校。",
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
