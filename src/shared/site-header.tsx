import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/modules/auth/auth";
import { signOutAction } from "@/modules/users/actions";

// 全局导航:登录后显示收藏入口 + 邮箱 + 退出;未登录显示登录/注册
export async function SiteHeader() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          Учёба в Китае
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/universities" className="hover:text-blue-600">
            Университеты
          </Link>
          <Link href="/scholarships" className="hover:text-blue-600">
            Стипендии
          </Link>
          {session ? (
            <>
              <Link href="/favorites" className="text-red-600 hover:text-red-700">
                ♥ Избранное
              </Link>
              <span className="hidden text-gray-400 sm:inline">
                {session.user.email}
              </span>
              <form action={signOutAction}>
                <button type="submit" className="text-gray-500 underline">
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hover:text-blue-600">
                Войти
              </Link>
              <Link
                href="/sign-up"
                className="rounded bg-blue-600 px-3 py-1.5 text-white"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
