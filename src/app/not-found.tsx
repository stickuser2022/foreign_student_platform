import Link from "next/link";
import { Compass } from "lucide-react";

// 全局 404(前台零中文原则,俄语)
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <Compass className="size-10 text-muted" />
      <h1 className="mt-6 font-serif text-6xl font-light tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted">
        Такой страницы нет. Возможно, ссылка устарела или адрес введён с ошибкой.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-full bg-ink px-6 py-2.5 text-sm text-cream transition-colors hover:bg-accent"
        >
          На главную
        </Link>
        <Link
          href="/universities"
          className="rounded-full border border-ink px-6 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          Каталог университетов
        </Link>
      </div>
    </main>
  );
}
