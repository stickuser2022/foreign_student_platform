import { prisma } from "@/shared/db";
import { Prisma } from "@/generated/prisma/client";

// P2 列表筛选维度(蓝图第 2 节:不超 5 个)
export type UniversityFilter = {
  province?: string;
  universityType?: string;
  level?: string; // "985" | "211" | "dfc"
  cost?: string; // "lt2000" | "mid" | "gt3500"
};

export async function listUniversities(filter: UniversityFilter = {}) {
  const where: Prisma.UniversityWhereInput = {
    // 公开页面只显示已发布数据(待审核的在后台确认队列)
    dataStatus: "PUBLISHED",
  };
  if (filter.province) where.province = filter.province;
  if (filter.universityType) {
    where.universityType = filter.universityType as Prisma.UniversityWhereInput["universityType"];
  }
  if (filter.level === "985") where.is985 = true;
  if (filter.level === "211") where.is211 = true;
  if (filter.level === "dfc") where.isDoubleFirstClass = true;
  if (filter.cost === "lt2000") where.livingCostPerMonth = { lte: 2000 };
  if (filter.cost === "mid") where.livingCostPerMonth = { gt: 2000, lte: 3500 };
  if (filter.cost === "gt3500") where.livingCostPerMonth = { gt: 3500 };

  return prisma.university.findMany({
    where,
    orderBy: { nameZh: "asc" },
    include: { _count: { select: { programs: true } } },
  });
}

// 筛选器省份选项(已发布学校的去重省份)
export async function listPublishedProvinces() {
  const rows = await prisma.university.findMany({
    where: { dataStatus: "PUBLISHED" },
    select: { province: true },
    distinct: ["province"],
    orderBy: { province: "asc" },
  });
  return rows.map((r) => r.province);
}

export async function getUniversityBySlug(slug: string) {
  return prisma.university.findFirst({
    where: { slug, dataStatus: "PUBLISHED" },
    include: {
      programs: { where: { dataStatus: "PUBLISHED" } },
      scholarships: { where: { dataStatus: "PUBLISHED" } },
    },
  });
}

// 平台级奖学金(不绑定学校,如 CSC)
export async function listPlatformScholarships() {
  return prisma.scholarship.findMany({
    where: { universityId: null, dataStatus: "PUBLISHED" },
    orderBy: { name: "asc" },
  });
}
