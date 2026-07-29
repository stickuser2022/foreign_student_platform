import { prisma } from "@/shared/db";

export async function listUniversities() {
  return prisma.university.findMany({
    orderBy: { nameZh: "asc" },
    include: { _count: { select: { programs: true } } },
  });
}
