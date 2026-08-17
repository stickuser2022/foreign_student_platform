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

export async function listUniversitiesForSelect() {
  return prisma.university.findMany({
    orderBy: { nameZh: "asc" },
    select: { id: true, nameZh: true, city: true, dataStatus: true },
  });
}

export async function listAllPrograms() {
  return prisma.program.findMany({
    orderBy: [{ university: { nameZh: "asc" } }, { nameZh: "asc" }],
    include: { university: { select: { nameZh: true } } },
  });
}

export async function listAllUniversities() {
  return prisma.university.findMany({
    orderBy: { nameZh: "asc" },
  });
}

export async function getUniversity(id: string) {
  return prisma.university.findUnique({ where: { id } });
}

export async function listAllScholarships() {
  return prisma.scholarship.findMany({
    orderBy: { name: "asc" },
    include: { university: { select: { nameZh: true } } },
  });
}

export async function getScholarship(id: string) {
  return prisma.scholarship.findUnique({ where: { id } });
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
      include: {
        university: { select: { nameZh: true, dataStatus: true } },
      },
    }),
    prisma.scholarship.findMany({
      where: { dataStatus: "DRAFT" },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return { universities, programs, scholarships };
}
