import Link from "next/link";
import { headers } from "next/headers";
import { Heart } from "lucide-react";
import { auth } from "@/modules/auth/auth";
import { signOutAction } from "@/modules/users/actions";

// 全局导航(docs/04):极简、发丝线、胶囊 CTA;登录后显示收藏入口 + 邮箱 + 退出
export async function SiteHeader() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-serif text-lg tracking-tight whitespace-nowrap sm:text-xl"
        >
          Учёба в Китае
        </Link>
        <nav className="flex items-center gap-3 text-sm sm:gap-6">
          <Link
            href="/universities"
            className="hidden transition-colors hover:text-accent sm:inline"
          >
            Университеты
          </Link>
          <Link
            href="/scholarships"
            className="hidden transition-colors hover:text-accent sm:inline"
          >
            Стипендии
          </Link>
          {session ? (
            <>
              <Link
                href="/favorites"
                className="flex items-center gap-1.5 text-accent transition-colors hover:opacity-80"
              >
                <Heart className="size-4 fill-current" />
                Избранное
              </Link>
              <span className="hidden text-muted lg:inline">
                {session.user.email}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="transition-colors hover:text-accent"
              >
                Войти
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-ink px-4 py-2 text-sm whitespace-nowrap text-cream transition-colors hover:bg-accent sm:px-5"
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
