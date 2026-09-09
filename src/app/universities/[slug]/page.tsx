import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
  Heart,
} from "lucide-react";
import { auth } from "@/modules/auth/auth";
import {
  getUniversityBySlug,
  listPlatformScholarships,
} from "@/modules/universities/service";
import { isFavoriteUniversity } from "@/modules/users/service";
import { toggleFavoriteUniversity } from "@/modules/users/actions";
import {
  universityTypeRu,
  degreeLevelRu,
  teachingLanguageRu,
  scholarshipTypeRu,
} from "@/modules/universities/labels";
import { formatDual, getCnyToRubRate } from "@/shared/money";
import { geoToRu } from "@/modules/universities/geo";
import { UniversityLogo } from "@/modules/universities/logo";
import { PhotoGallery } from "@/modules/universities/photo-gallery";

function range(values: (number | null)[]): [number, number] | null {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

// 区间紧凑显示:"¥20 000 – 26 000 (≈ 246 609 – 320 592 ₽) / год"
function formatRange(
  r: [number, number] | null,
  suffix: string,
  rate: number | null
): string | null {
  if (!r) return null;
  const [min, max] = r;
  if (min === max) return `${formatDual(min, rate)} ${suffix}`;
  const rub =
    rate != null
      ? ` (≈ ${Math.round(min * rate).toLocaleString("ru-RU")} – ${Math.round(max * rate).toLocaleString("ru-RU")} ₽)`
      : "";
  return `¥${min.toLocaleString("ru-RU")} – ${max.toLocaleString("ru-RU")}${rub} ${suffix}`;
}

// 规格表一行:发丝线分隔
function SpecRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-hairline py-3 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const university = await getUniversityBySlug(slug);
  if (!university) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const favorited = session
    ? await isFavoriteUniversity(session.user.id, university.id)
    : false;

  const platformScholarships = await listPlatformScholarships();
  const allScholarships = [...university.scholarships, ...platformScholarships];

  const fx = await getCnyToRubRate();
  const rate = fx?.rate ?? null;
  const tuition = range(university.programs.map((p) => p.tuitionPerYear));
  const hostel = range(university.programs.map((p) => p.hostelFeePerYear));
  const insurance = range(university.programs.map((p) => p.insuranceFeePerYear));

  const badges: string[] = [];
  if (university.is985) badges.push("985");
  if (university.is211) badges.push("211");
  if (university.isDoubleFirstClass) badges.push("Двойной первоклассный");

  return (
    <main className="mx-auto max-w-5xl px-6 pt-10 pb-24">
      <Link
        href="/universities"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Все университеты
      </Link>

      {/* 1. 头部:有校园照则画廊入场,否则排版式头部 */}
      <header className="mt-8">
        {university.photos.length > 0 && (
          <PhotoGallery
            photos={university.photos}
            alt={university.nameRu ?? university.nameEn ?? ""}
          />
        )}
        <div className="flex items-start gap-6">
          <UniversityLogo
            logoUrl={university.logoUrl}
            name={university.nameRu ?? university.nameEn ?? ""}
            size={88}
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-4xl font-light tracking-tight sm:text-5xl">
              {university.nameRu ?? university.nameEn ?? ""}
            </h1>
            {university.nameRu && university.nameEn && (
              <p className="mt-2 text-lg text-muted">{university.nameEn}</p>
            )}
            <p className="mt-3 text-muted">
              {geoToRu(university.province, university.city)} ·{" "}
              {universityTypeRu[university.universityType] ?? university.universityType}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-hairline px-3 py-1 text-xs tracking-wide"
                >
                  {b}
                </span>
              ))}
              {university.website && (
                <a
                  href={university.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1 text-xs transition-colors hover:border-accent hover:text-accent"
                >
                  Официальный сайт <ArrowUpRight className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
        {/* 收藏按钮:未登录点击 → 引导注册 */}
        <form
          action={toggleFavoriteUniversity.bind(null, university.id)}
          className="mt-6"
        >
          <button
            type="submit"
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors ${
              favorited
                ? "bg-accent text-white"
                : "border border-ink hover:border-accent hover:text-accent"
            }`}
          >
            <Heart
              className={`size-4 ${favorited ? "fill-current" : ""}`}
            />
            {favorited ? "В избранном" : "В избранное"}
          </button>
        </form>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_320px]">
        {/* 左栏:简介/学科/项目/奖学金 */}
        <div>
          {university.descriptionRu && (
            <section>
              <h2 className="font-serif text-3xl font-light">Об университете</h2>
              <p className="mt-4 leading-relaxed text-ink/80">
                {university.descriptionRu}
              </p>
            </section>
          )}

          {university.strongDisciplinesRu.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-3xl font-light">
                Сильные направления
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {university.strongDisciplinesRu.map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-hairline px-3 py-1 text-sm"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 项目列表:目录行 */}
          <section className="mt-12">
            <h2 className="font-serif text-3xl font-light">
              Программы{" "}
              <span className="text-muted">({university.programs.length})</span>
            </h2>
            {university.programs.length === 0 ? (
              <p className="mt-4 text-muted">Информация о программах уточняется.</p>
            ) : (
              <ul className="mt-6 border-t border-hairline">
                {university.programs.map((p) => (
                  <li key={p.id} className="border-b border-hairline">
                    <Link
                      href={`/programs/${p.id}`}
                      className="group flex items-center justify-between gap-4 px-2 py-4 transition-colors hover:bg-white"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate font-medium transition-colors group-hover:text-accent">
                          {p.nameRu ?? p.nameEn ?? ""}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted">
                          {degreeLevelRu[p.degreeLevel] ?? p.degreeLevel}
                          {p.durationYears ? ` · ${p.durationYears} г.` : ""} ·{" "}
                          {p.teachingLanguages
                            .map((l) => teachingLanguageRu[l] ?? l)
                            .join(", ")}
                          {p.applicationDeadline &&
                            ` · до ${p.applicationDeadline.toLocaleDateString("ru-RU")}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        {p.tuitionPerYear != null && (
                          <span className="hidden text-sm sm:inline">
                            {formatDual(p.tuitionPerYear, rate)} / год
                          </span>
                        )}
                        <ArrowRight className="size-4 -translate-x-1 text-muted opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 奖学金:目录行 */}
          {allScholarships.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-3xl font-light">Стипендии</h2>
              <ul className="mt-6 border-t border-hairline">
                {allScholarships.map((s) => (
                  <li key={s.id} className="border-b border-hairline px-2 py-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="mt-1 size-4 shrink-0 text-accent" />
                      <div>
                        <h3 className="font-medium">{s.nameRu ?? s.name}</h3>
                        <p className="mt-0.5 text-sm text-muted">
                          {scholarshipTypeRu[s.type] ?? s.type}
                          {s.coverageRu && ` · ${s.coverageRu}`}
                          {s.deadline &&
                            ` · до ${s.deadline.toLocaleDateString("ru-RU")}`}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* 右栏:费用规格表(吸住) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-hairline bg-white p-6">
            <h2 className="text-sm tracking-wide text-muted uppercase">
              Стоимость
            </h2>
            <div className="mt-3">
              <SpecRow label="Обучение" value={formatRange(tuition, "/ год", rate)} />
              <SpecRow label="Общежитие" value={formatRange(hostel, "/ год", rate)} />
              <SpecRow label="Страховка" value={formatRange(insurance, "/ год", rate)} />
              {university.livingCostPerMonth != null && (
                <SpecRow
                  label="Прожиточные расходы"
                  value={`${formatDual(university.livingCostPerMonth, rate)} / мес`}
                />
              )}
            </div>
            {fx && (
              <p className="mt-4 text-xs text-muted">
                Курс {fx.source}: 1 ¥ ≈ {fx.rate.toFixed(2)} ₽
              </p>
            )}
            {university.lastVerifiedAt && (
              <p className="mt-3 border-t border-hairline pt-3 text-xs text-muted">
                Проверено:{" "}
                {university.lastVerifiedAt.toLocaleDateString("ru-RU")}
                {university.sourceUrl && (
                  <>
                    {" · "}
                    <a
                      href={university.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      источник
                    </a>
                  </>
                )}
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
