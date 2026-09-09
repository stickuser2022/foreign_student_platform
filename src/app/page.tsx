import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import {
  publicStats,
  listFeaturedUniversities,
  listForMap,
} from "@/modules/universities/service";
import { UniversityLogo } from "@/modules/universities/logo";
import { geoToRu, provinceToRu, cityToRu } from "@/modules/universities/geo";
import { getCnyToRubRate } from "@/shared/money";
import { ChinaMap, type MapProvince } from "@/modules/universities/china-map";

// 首页(docs/04):大标语逐词浮现 → 编辑感数据区 → 精选学校 → 奖学金入口
export default async function Home() {
  const [stats, featured, fx, mapUnis] = await Promise.all([
    publicStats(),
    listFeaturedUniversities(6),
    getCnyToRubRate(),
    listForMap(),
  ]);

  // 按省份分组(地图数据)
  const provinceMap = new Map<string, MapProvince>();
  for (const u of mapUnis) {
    const g =
      provinceMap.get(u.province) ??
      { short: u.province, nameRu: provinceToRu(u.province), universities: [] };
    g.universities.push({
      slug: u.slug,
      name: u.nameRu ?? u.nameEn ?? "",
      logoUrl: u.logoUrl,
      programs: u._count.programs,
      cityRu: cityToRu(u.city),
      descriptionRu: u.descriptionRu,
    });
    provinceMap.set(u.province, g);
  }
  const mapProvinces = [...provinceMap.values()];

  const headline = ["Найди", "свой", "университет", "в", "Китае"];

  return (
    <main>
      {/* 1. Hero:超大标语,逐词浮现 */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <h1 className="text-[13vw] leading-[0.95] font-light tracking-tight uppercase sm:text-[9vw] lg:text-8xl">
          {headline.map((word, i) => (
            <span
              key={i}
              className="rise-in mr-[0.25em] inline-block"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {word === "свой" ? (
                <em className="font-serif text-accent normal-case">{word}</em>
              ) : (
                word
              )}
            </span>
          ))}
        </h1>
        <p
          className="rise-in mt-8 max-w-xl text-lg text-muted"
          style={{ animationDelay: "700ms" }}
        >
          Университеты, программы, стипендии и стоимость обучения — проверяемая
          информация на русском языке. Бесплатно.
        </p>
        <div
          className="rise-in mt-10 flex flex-wrap gap-4"
          style={{ animationDelay: "850ms" }}
        >
          <Link
            href="/universities"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-cream transition-colors hover:bg-accent"
          >
            Каталог университетов
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-2 rounded-full border border-ink px-8 py-3.5 transition-colors hover:border-accent hover:text-accent"
          >
            Стипендии
          </Link>
        </div>
      </section>

      {/* 2. 编辑感数据区:大数字+发丝线 */}
      <section className="border-y border-hairline">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-6 py-10">
            <p className="font-serif text-6xl font-light">{stats.universities}</p>
            <p className="mt-2 text-sm tracking-wide text-muted uppercase">
              университетов в каталоге
            </p>
          </div>
          <div className="px-6 py-10">
            <p className="font-serif text-6xl font-light">{stats.programs}</p>
            <p className="mt-2 text-sm tracking-wide text-muted uppercase">
              учебных программ
            </p>
          </div>
          <div className="px-6 py-10">
            <p className="font-serif text-6xl font-light">
              {fx ? fx.rate.toFixed(1) : "—"}
            </p>
            <p className="mt-2 text-sm tracking-wide text-muted uppercase">
              ₽ за 1 ¥{fx ? ` · курс ${fx.source}` : ""}
            </p>
          </div>
        </div>
      </section>

      {/* 3. 互动地图招牌 */}
      {mapProvinces.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-2 font-serif text-4xl font-light">Где учиться?</h2>
          <p className="mb-8 text-muted">
            Нажмите на провинцию — покажем университеты
          </p>
          <ChinaMap provinces={mapProvinces} />
        </section>
      )}

      {/* 4. 精选学校 */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-4xl">Университеты</h2>
            <Link
              href="/universities"
              className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
            >
              Все {stats.universities}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((u) => (
              <li key={u.id}>
                <Link href={`/universities/${u.slug}`} className="group block">
                  <div className="flex aspect-[3/2] items-center justify-center overflow-hidden border border-hairline bg-white">
                    {u.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.logoUrl}
                        alt={u.nameRu ?? u.nameEn ?? ""}
                        className="max-h-28 max-w-[80%] object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <UniversityLogo logoUrl={null} name={u.nameRu ?? u.nameEn ?? ""} size={96} />
                    )}
                  </div>
                  <h3 className="mt-4 font-medium transition-colors group-hover:text-accent">
                    {u.nameRu ?? u.nameEn}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {geoToRu(u.province, u.city)} · Программ: {u._count.programs}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. 奖学金入口 */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Link
          href="/scholarships"
          className="group flex items-center justify-between border border-hairline bg-white p-8 transition-colors hover:border-accent"
        >
          <div className="flex items-center gap-5">
            <GraduationCap className="size-8 text-accent" />
            <div>
              <p className="font-serif text-2xl">Стипендии</p>
              <p className="mt-1 text-sm text-muted">
                CSC, провинциальные и университетские гранты — {stats.scholarships} в каталоге
              </p>
            </div>
          </div>
          <ArrowRight className="size-6 text-muted transition-all group-hover:translate-x-1 group-hover:text-accent" />
        </Link>
      </section>
    </main>
  );
}
