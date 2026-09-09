import Link from "next/link";
import { ArrowRight, ChevronDown, SearchX } from "lucide-react";
import {
  listUniversities,
  listPublishedProvinces,
  type UniversityFilter,
} from "@/modules/universities/service";
import { universityTypeRu } from "@/modules/universities/labels";
import { geoToRu } from "@/modules/universities/geo";
import { UniversityLogo } from "@/modules/universities/logo";

// 筛选下拉:下划线极简风(docs/04)
const selectClass =
  "appearance-none bg-transparent border-b border-hairline py-2 pr-7 text-sm outline-none transition-colors focus:border-ink cursor-pointer";

function FilterSelect({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs tracking-wide text-muted uppercase">{label}</span>
      <span className="relative inline-block">
        <select name={name} defaultValue={value ?? ""} className={selectClass}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-muted" />
      </span>
    </label>
  );
}

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
  const hasFilter = Object.values(filter).some(Boolean);

  const [universities, provinces] = await Promise.all([
    listUniversities(filter),
    listPublishedProvinces(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 pt-16 pb-24">
      {/* 头部:衬线大标题 + 实时计数 */}
      <header className="mb-12">
        <h1 className="font-serif text-5xl font-light tracking-tight sm:text-6xl">
          Университеты
        </h1>
        <p className="mt-3 text-muted">
          Каталог университетов Китая для российских студентов
        </p>
      </header>

      {/* 筛选器 */}
      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-x-8 gap-y-4"
      >
        <FilterSelect label="Провинция" name="province" value={filter.province}>
          <option value="">Все</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {geoToRu(p, p)}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="Тип" name="type" value={filter.universityType}>
          <option value="">Все</option>
          {Object.entries(universityTypeRu).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="Уровень" name="level" value={filter.level}>
          <option value="">Все</option>
          <option value="985">985</option>
          <option value="211">211</option>
          <option value="dfc">Двойной первоклассный</option>
        </FilterSelect>

        <FilterSelect label="Прожиточные расходы" name="cost" value={filter.cost}>
          <option value="">Любые</option>
          <option value="lt2000">до 2 000 ¥/мес</option>
          <option value="mid">2 000 – 3 500 ¥/мес</option>
          <option value="gt3500">более 3 500 ¥/мес</option>
        </FilterSelect>

        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-2 text-sm text-cream transition-colors hover:bg-accent"
        >
          Показать
        </button>
        {hasFilter && (
          <Link
            href="/universities"
            className="py-2 text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Сбросить
          </Link>
        )}
      </form>

      {/* 计数 */}
      <p className="mb-2 text-sm text-muted">
        {hasFilter
          ? `Найдено: ${universities.length}`
          : `Всего: ${universities.length}`}
      </p>

      {/* 目录索引式列表:编号 + 发丝线 */}
      {universities.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border-t border-hairline py-20 text-center">
          <SearchX className="size-8 text-muted" />
          <p className="text-muted">
            По выбранным фильтрам ничего не найдено.
            <br />
            Попробуйте смягчить условия.
          </p>
          <Link
            href="/universities"
            className="rounded-full border border-ink px-6 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            Показать все
          </Link>
        </div>
      ) : (
        <ul className="border-t border-hairline">
          {universities.map((u, i) => (
            <li
              key={u.id}
              className="rise-in border-b border-hairline"
              style={{ animationDelay: `${Math.min(i * 40, 800)}ms` }}
            >
              <Link
                href={`/universities/${u.slug}`}
                className="group flex items-center gap-5 px-2 py-5 transition-colors hover:bg-white"
              >
                <span className="w-8 text-sm text-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <UniversityLogo
                  logoUrl={u.logoUrl}
                  name={u.nameRu ?? u.nameEn ?? ""}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-medium transition-colors group-hover:text-accent">
                    {u.nameRu ?? u.nameEn}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted">
                    {geoToRu(u.province, u.city)} · Программ: {u._count.programs}
                    {u.livingCostPerMonth != null &&
                      ` · ~¥${u.livingCostPerMonth.toLocaleString("ru-RU")}/мес`}
                  </p>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  {u.is985 && (
                    <span className="rounded-full border border-hairline px-2.5 py-0.5 text-xs">
                      985
                    </span>
                  )}
                  {u.is211 && (
                    <span className="rounded-full border border-hairline px-2.5 py-0.5 text-xs">
                      211
                    </span>
                  )}
                </div>
                <ArrowRight className="size-5 -translate-x-2 text-muted opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
