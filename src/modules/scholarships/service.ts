import { prisma } from "@/shared/db";
import type { ScholarshipType } from "@/generated/prisma/enums";

// 奖学金目录:可按类型筛选;学校级奖学金带出所属学校
export async function listScholarships(type?: ScholarshipType) {
  return prisma.scholarship.findMany({
    where: {
      dataStatus: "PUBLISHED",
      ...(type ? { type } : {}),
    },
    orderBy: [{ deadline: "asc" }, { name: "asc" }],
    include: { university: { select: { slug: true, nameZh: true, nameRu: true, nameEn: true } } },
  });
}
