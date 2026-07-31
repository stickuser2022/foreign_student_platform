"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/shared/db";
import { revalidatePath } from "next/cache";

// 未登录点收藏 → 引导注册/登录(注册钩子,蓝图原则 3:门槛后置)
async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return session.user;
}

export async function toggleFavoriteUniversity(universityId: string) {
  const user = await requireUser();
  const existing = await prisma.favoriteUniversity.findUnique({
    where: { userId_universityId: { userId: user.id, universityId } },
  });
  if (existing) {
    await prisma.favoriteUniversity.delete({ where: { id: existing.id } });
  } else {
    await prisma.favoriteUniversity.create({
      data: { userId: user.id, universityId },
    });
  }
  revalidatePath("/favorites");
}

export async function toggleFavoriteProgram(programId: string) {
  const user = await requireUser();
  const existing = await prisma.favoriteProgram.findUnique({
    where: { userId_programId: { userId: user.id, programId } },
  });
  if (existing) {
    await prisma.favoriteProgram.delete({ where: { id: existing.id } });
  } else {
    await prisma.favoriteProgram.create({ data: { userId: user.id, programId } });
  }
  revalidatePath("/favorites");
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
