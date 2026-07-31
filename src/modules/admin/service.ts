import { prisma } from "@/shared/db";

export async function adminCounts() {
  const [uDraft, uPub, pDraft, pPub, sDraft, sPub] = await Promise.all([
    prisma.university.count({ where: { dataStatus: "DRAFT" } }),
    prisma.university.count({ where: { dataStatus: "PUBLISHED" } }),
    prisma.program.count({ where: { dataStatus: "DRAFT" } }),
    prisma.program.count({ where: { dataStatus: "PUBLISHED" } }),
    prisma.scholarship.count({ where: { dataStatus: "DRAFT" } }),
    prisma.scholarship.count({ where: { dataStatus: "PUBLISHED" } }),
  ]);
  return {
    universities: { draft: uDraft, published: uPub },
    programs: { draft: pDraft, published: pPub },
    scholarships: { draft: sDraft, published: sPub },
  };
}

export async function listDrafts() {
  const [universities, programs, scholarships] = await Promise.all([
    prisma.university.findMany({
      where: { dataStatus: "DRAFT" },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.program.findMany({
      where: { dataStatus: "DRAFT" },
      orderBy: { updatedAt: "desc" },
      include: { university: { select: { nameZh: true } } },
    }),
    prisma.scholarship.findMany({
      where: { dataStatus: "DRAFT" },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return { universities, programs, scholarships };
}
