import Link from "next/link";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import { listScholarships } from "@/modules/scholarships/service";
import { scholarshipTypeRu } from "@/modules/universities/labels";
import type { ScholarshipType } from "@/generated/prisma/enums";

const TYPES: ScholarshipType[] = ["CSC", "PROVINCIAL", "UNIVERSITY", "OTHER"];

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType = TYPES.includes(type as ScholarshipType)
    ? (type as ScholarshipType)
    : undefined;
  const scholarships = await listScholarships(activeType);

  return (
    <main className="mx-auto max-w-5xl px-6 pt-16 pb-24">
      {/* 头部 */}
      <header className="mb-10">
        <h1 className="font-serif text-5xl font-light tracking-tight sm:text-6xl">
          Стипендии
        </h1>
        <p className="mt-3 text-muted">
          Гранты и стипендии для российских студентов в Китае
        </p>
      </header>

      {/* 类型筛选:下划线 tab */}
      <nav className="mb-4 flex flex-wrap gap-x-8 gap-y-2 border-b border-hairline">
        <Link
          href="/scholarships"
          className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
            !activeType
              ? "border-accent font-medium text-accent"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Все
        </Link>
        {TYPES.map((t) => (
          <Link
            key={t}
            href={`/scholarships?type=${t}`}
            className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
              activeType === t
                ? "border-accent font-medium text-accent"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {scholarshipTypeRu[t]}
          </Link>
        ))}
      </nav>

      <p className="mb-2 text-sm text-muted">Найдено: {scholarships.length}</p>

      {/* 目录行 */}
      {scholarships.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border-t border-hairline py-20 text-center">
          <GraduationCap className="size-8 text-muted" />
          <p className="text-muted">В этой категории пока нет стипендий.</p>
        </div>
      ) : (
        <ul className="border-t border-hairline">
          {scholarships.map((s, i) => (
            <li
              key={s.id}
              className="rise-in border-b border-hairline"
              style={{ animationDelay: `${Math.min(i * 40, 800)}ms` }}
            >
              <div className="group flex items-start justify-between gap-4 px-2 py-5 transition-colors hover:bg-white">
                <div className="min-w-0">
                  <h2 className="font-medium">{s.nameRu ?? s.name}</h2>
                  <p className="mt-0.5 text-sm text-muted">
                    {scholarshipTypeRu[s.type] ?? s.type}
                    {s.university && (
                      <>
                        {" · "}
                        <Link
                          href={`/universities/${s.university.slug}`}
                          className="underline-offset-2 transition-colors hover:text-accent hover:underline"
                        >
                          {s.university.nameRu ?? s.university.nameEn ?? ""}
                        </Link>
                      </>
                    )}
                  </p>
                  {s.coverageRu && (
                    <p className="mt-1.5 text-sm text-ink/80">{s.coverageRu}</p>
                  )}
                  {s.applicationChannelRu && (
                    <p className="mt-1 text-xs text-muted">
                      Куда подавать: {s.applicationChannelRu}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {s.deadline && (
                    <span className="rounded-full border border-hairline px-3 py-1 text-xs whitespace-nowrap">
                      до {s.deadline.toLocaleDateString("ru-RU")}
                    </span>
                  )}
                  {s.sourceUrl && (
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-accent"
                    >
                      Подробнее <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
