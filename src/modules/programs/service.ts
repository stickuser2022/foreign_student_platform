import { prisma } from "@/shared/db";

export async function getProgramById(id: string) {
  return prisma.program.findFirst({
    where: { id, dataStatus: "PUBLISHED" },
    include: { university: true },
  });
}
