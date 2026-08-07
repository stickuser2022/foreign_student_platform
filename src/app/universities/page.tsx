import Link from "next/link";
import {
  listUniversities,
  listPublishedProvinces,
  type UniversityFilter,
} from "@/modules/universities/service";
import { universityTypeRu } from "@/modules/universities/labels";
import { UniversityLogo } from "@/modules/universities/logo";

const selectClass =
  "rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900";

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string) => {
    const v = sp[k];
    return typeof v === "string" && v ? v : undefined;
  };
  const filter: UniversityFilter = {
    province: pick("province"),
    universityType: pick("type"),
    level: pick("level"),
    cost: pick("cost"),
  };

  const [universities, provinces] = await Promise.all([
    listUniversities(filter),
    listPublishedProvinces(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Университеты Китая</h1>

      <form
        method="get"
        className="mb-8 flex flex-wrap items-end gap-3 rounded-lg border p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          Провинция
          <select name="province" defaultValue={filter.province ?? ""} className={selectClass}>
            <option value="">Все</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Тип
          <select name="type" defaultValue={filter.universityType ?? ""} className={selectClass}>
            <option value="">Все</option>
            {Object.entries(universityTypeRu).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Уровень
          <select name="level" defaultValue={filter.level ?? ""} className={selectClass}>
            <option value="">Все</option>
            <option value="985">985</option>
            <option value="211">211</option>
            <option value="dfc">双一流</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Расходы на жизнь, ¥/мес
          <select name="cost" defaultValue={filter.cost ?? ""} className={selectClass}>
            <option value="">Любые</option>
            <option value="lt2000">до 2 000</option>
            <option value="mid">2 000 – 3 500</option>
            <option value="gt3500">более 3 500</option>
          </select>
        </label>

        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          Показать
        </button>
        <Link href="/universities" className="px-2 py-1.5 text-sm text-blue-600 underline">
          Сбросить
        </Link>
      </form>

      <p className="mb-4 text-sm text-gray-500">
        Найдено университетов: {universities.length}
      </p>

      {universities.length === 0 ? (
        <p className="text-gray-500">
          По выбранным фильтрам ничего не найдено. Попробуйте смягчить условия.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {universities.map((u) => (
            <li key={u.id}>
              <Link
                href={`/universities/${u.slug}`}
                className="flex items-start gap-3 rounded-lg border p-4 transition hover:border-blue-400 hover:shadow"
              >
                <UniversityLogo
                  logoUrl={u.logoUrl}
                  name={u.nameRu ?? u.nameEn ?? u.nameZh}
                />
                <div className="min-w-0">
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
                    {u.livingCostPerMonth && (
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-xs">
                        ¥{u.livingCostPerMonth.toLocaleString("ru-RU")}/мес
                      </span>
                    )}
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                      Программ: {u._count.programs}
                    </span>
                  </div>
                </div>
              </Link>
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
