import Link from "next/link";
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
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Стипендии</h1>

      {/* 类型筛选 */}
      <nav className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/scholarships"
          className={`rounded-full px-4 py-1.5 text-sm ${
            !activeType ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Все
        </Link>
        {TYPES.map((t) => (
          <Link
            key={t}
            href={`/scholarships?type=${t}`}
            className={`rounded-full px-4 py-1.5 text-sm ${
              activeType === t ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {scholarshipTypeRu[t]}
          </Link>
        ))}
      </nav>

      {scholarships.length === 0 ? (
        <p className="text-gray-500">Пока нет данных.</p>
      ) : (
        <ul className="grid gap-4">
          {scholarships.map((s) => (
            <li key={s.id} className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">{s.nameRu ?? s.name}</h2>
              <p className="mt-1 text-sm text-gray-600">
                {scholarshipTypeRu[s.type] ?? s.type}
                {s.university && (
                  <>
                    {" · "}
                    <Link
                      href={`/universities/${s.university.slug}`}
                      className="text-blue-600 underline"
                    >
                      {s.university.nameRu ?? s.university.nameEn ?? ""}
                    </Link>
                  </>
                )}
              </p>
              {s.coverageRu && (
                <p className="mt-2 text-sm">Покрывает: {s.coverageRu}</p>
              )}
              {s.deadline && (
                <p className="mt-1 text-sm text-red-600">
                  Дедлайн: {s.deadline.toLocaleDateString("ru-RU")}
                </p>
              )}
              {s.applicationChannel && (
                <p className="mt-1 text-sm text-gray-600">
                  Куда подавать: {s.applicationChannel}
                </p>
              )}
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
