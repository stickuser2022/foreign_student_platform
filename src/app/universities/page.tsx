import Link from "next/link";
import { listUniversities } from "@/modules/universities/service";

export default async function UniversitiesPage() {
  const universities = await listUniversities();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Университеты Китая</h1>
      {universities.length === 0 ? (
        <p className="text-gray-500">Пока нет данных. Запустите seed-скрипт.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {universities.map((u) => (
            <li key={u.id} className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">
                {u.nameRu ?? u.nameEn ?? u.nameZh}
              </h2>
              <p className="text-sm text-gray-500">
                {u.province} · {u.city}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {u.is985 && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs">985</span>
                )}
                {u.is211 && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs">211</span>
                )}
                {u.isDoubleFirstClass && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs">双一流</span>
                )}
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                  Программ: {u._count.programs}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-sm">
        <Link href="/" className="text-blue-600 underline">
          ← На главную
        </Link>
      </p>
    </main>
  );
}
