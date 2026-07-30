import { prisma } from "@/shared/db";

export async function listUniversities() {
  return prisma.university.findMany({
    // 公开页面只显示已发布数据(待审核的在后台确认队列)
    where: { dataStatus: "PUBLISHED" },
    orderBy: { nameZh: "asc" },
    include: { _count: { select: { programs: true } } },
  });
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
