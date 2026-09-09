import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { auth } from "@/modules/auth/auth";
import { listFavorites } from "@/modules/users/service";
import { degreeLevelRu, teachingLanguageRu } from "@/modules/universities/labels";
import { geoToRu } from "@/modules/universities/geo";
import { UniversityLogo } from "@/modules/universities/logo";
import { formatDual, getCnyToRubRate } from "@/shared/money";

export default async function FavoritesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const [{ universities, programs }, fx] = await Promise.all([
    listFavorites(session.user.id),
    getCnyToRubRate(),
  ]);
  const rate = fx?.rate ?? null;

  const empty = universities.length === 0 && programs.length === 0;

  return (
    <main className="mx-auto max-w-5xl px-6 pt-16 pb-24">
      <header className="mb-10">
        <h1 className="font-serif text-5xl font-light tracking-tight sm:text-6xl">
          Избранное
        </h1>
        <p className="mt-3 text-muted">Ваши сохранённые университеты и программы</p>
      </header>

      {empty ? (
        <div className="flex flex-col items-center gap-4 border-t border-hairline py-20 text-center">
          <Heart className="size-8 text-muted" />
          <p className="text-muted">
            Пока пусто. Отмечайте сердечком университеты и программы — они появятся здесь.
          </p>
          <Link
            href="/universities"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm text-cream transition-colors hover:bg-accent"
          >
            Каталог университетов
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <>
          {/* 学校:目录行 */}
          <section className="mb-12">
            <h2 className="mb-4 text-sm tracking-wide text-muted uppercase">
              Университеты ({universities.length})
            </h2>
            {universities.length > 0 && (
              <ul className="border-t border-hairline">
                {universities.map(({ university: u }) => (
                  <li key={u.id} className="border-b border-hairline">
                    <Link
                      href={`/universities/${u.slug}`}
                      className="group flex items-center gap-4 px-2 py-4 transition-colors hover:bg-white"
                    >
                      <UniversityLogo
                        logoUrl={u.logoUrl}
                        name={u.nameRu ?? u.nameEn ?? ""}
                        size={40}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium transition-colors group-hover:text-accent">
                          {u.nameRu ?? u.nameEn}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted">
                          {geoToRu(u.province, u.city)} · Программ: {u._count.programs}
                        </p>
                      </div>
                      <ArrowRight className="size-4 -translate-x-1 text-muted opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 项目:目录行 */}
          <section>
            <h2 className="mb-4 text-sm tracking-wide text-muted uppercase">
              Программы ({programs.length})
            </h2>
            {programs.length > 0 && (
              <ul className="border-t border-hairline">
                {programs.map(({ program: p }) => (
                  <li key={p.id} className="border-b border-hairline">
                    <Link
                      href={`/programs/${p.id}`}
                      className="group flex items-center justify-between gap-4 px-2 py-4 transition-colors hover:bg-white"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate font-medium transition-colors group-hover:text-accent">
                          {p.nameRu ?? p.nameEn}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted">
                          {p.university.nameRu ?? p.university.nameEn ?? ""} ·{" "}
                          {degreeLevelRu[p.degreeLevel] ?? p.degreeLevel} ·{" "}
                          {p.teachingLanguages
                            .map((l) => teachingLanguageRu[l] ?? l)
                            .join(", ")}
                        </p>
                      </div>
                      {p.tuitionPerYear != null && (
                        <span className="hidden shrink-0 text-sm sm:inline">
                          {formatDual(p.tuitionPerYear, rate)} / год
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
