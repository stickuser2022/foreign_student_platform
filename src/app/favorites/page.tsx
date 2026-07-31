import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/auth";
import { listFavorites } from "@/modules/users/service";
import { degreeLevelRu, teachingLanguageRu } from "@/modules/universities/labels";
import { formatDual } from "@/shared/money";

export default async function FavoritesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { universities, programs } = await listFavorites(session.user.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Избранное</h1>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">
          Университеты ({universities.length})
        </h2>
        {universities.length === 0 ? (
          <p className="text-gray-500">Пока пусто.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {universities.map(({ university: u }) => (
              <li key={u.id}>
                <Link
                  href={`/universities/${u.slug}`}
                  className="block rounded-lg border p-4 transition hover:border-blue-400 hover:shadow"
                >
                  <h3 className="font-semibold">{u.nameRu ?? u.nameZh}</h3>
                  <p className="text-sm text-gray-500">
                    {u.province} · {u.city} · Программ: {u._count.programs}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Программы ({programs.length})</h2>
        {programs.length === 0 ? (
          <p className="text-gray-500">Пока пусто.</p>
        ) : (
          <ul className="grid gap-4">
            {programs.map(({ program: p }) => (
              <li key={p.id}>
                <Link
                  href={`/programs/${p.id}`}
                  className="block rounded-lg border p-4 transition hover:border-blue-400 hover:shadow"
                >
                  <h3 className="font-semibold">{p.nameRu ?? p.nameZh}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {p.university.nameRu ?? p.university.nameZh} ·{" "}
                    {degreeLevelRu[p.degreeLevel] ?? p.degreeLevel} ·{" "}
                    {p.teachingLanguages
                      .map((l) => teachingLanguageRu[l] ?? l)
                      .join(", ")}
                  </p>
                  {p.tuitionPerYear && (
                    <p className="mt-1 text-sm">
                      Обучение: {formatDual(p.tuitionPerYear)} / год
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm">
        <Link href="/" className="text-blue-600 underline">
          ← На главную
        </Link>
      </p>
    </main>
  );
}
