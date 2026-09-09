import Link from "next/link";

// 全局页脚(docs/04):深色收底,极简链接
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-lg text-ink">Учёба в Китае</p>
          <p className="mt-1">
            Университеты, программы и стипендии — вся информация в одном месте.
          </p>
        </div>
        <nav className="flex gap-6">
          <Link href="/universities" className="transition-colors hover:text-ink">
            Университеты
          </Link>
          <Link href="/scholarships" className="transition-colors hover:text-ink">
            Стипендии
          </Link>
          <Link href="/favorites" className="transition-colors hover:text-ink">
            Избранное
          </Link>
        </nav>
      </div>
    </footer>
  );
}
