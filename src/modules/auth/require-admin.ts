import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/modules/auth/auth";

// 后台守卫:未登录 → 登录页;非管理员 → 404(不暴露后台存在)
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const role = (session.user as unknown as { role?: string }).role;
  if (role !== "platform_admin") notFound();
  return session.user;
}
