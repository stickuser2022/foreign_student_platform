import { prisma } from "@/shared/db";

export async function listUniversities() {
  return prisma.university.findMany({
    // 公开页面只显示已发布数据(待审核的在后台确认队列)
    where: { dataStatus: "PUBLISHED" },
    orderBy: { nameZh: "asc" },
    include: { _count: { select: { programs: true } } },
  });
}
