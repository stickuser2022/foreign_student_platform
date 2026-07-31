import { prisma } from "@/shared/db";

export async function isFavoriteUniversity(userId: string, universityId: string) {
  const fav = await prisma.favoriteUniversity.findUnique({
    where: { userId_universityId: { userId, universityId } },
    select: { id: true },
  });
  return fav != null;
}

export async function isFavoriteProgram(userId: string, programId: string) {
  const fav = await prisma.favoriteProgram.findUnique({
    where: { userId_programId: { userId, programId } },
    select: { id: true },
  });
  return fav != null;
}

// 我的收藏页数据:学校(带项目数) + 项目(带所属学校)
export async function listFavorites(userId: string) {
  const [universities, programs] = await Promise.all([
    prisma.favoriteUniversity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        university: { include: { _count: { select: { programs: true } } } },
      },
    }),
    prisma.favoriteProgram.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { program: { include: { university: true } } },
    }),
  ]);
  return { universities, programs };
}
