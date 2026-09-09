import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  ArrowLeft,
  ArrowUpRight,
  GraduationCap,
  Heart,
} from "lucide-react";
import { auth } from "@/modules/auth/auth";
import { getProgramById } from "@/modules/programs/service";
import { isFavoriteProgram } from "@/modules/users/service";
import { toggleFavoriteProgram } from "@/modules/users/actions";
import {
  degreeLevelRu,
  teachingLanguageRu,
} from "@/modules/universities/labels";
import { formatDual, getCnyToRubRate } from "@/shared/money";
import { geoToRu } from "@/modules/universities/geo";

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

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getProgramById(id);
  if (!program) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const favorited = session
    ? await isFavoriteProgram(session.user.id, program.id)
    : false;

  const fx = await getCnyToRubRate();
  const rate = fx?.rate ?? null;

  const u = program.university;

  return (
    <main className="mx-auto max-w-5xl px-6 pt-10 pb-24">
      <Link
        href={`/universities/${u.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" /> {u.nameRu ?? u.nameEn ?? ""}
      </Link>

      {/* 头部 */}
      <header className="mt-8">
        <p className="text-sm text-muted">
          {degreeLevelRu[program.degreeLevel] ?? program.degreeLevel} ·{" "}
          {geoToRu(u.province, u.city)}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-light tracking-tight sm:text-5xl">
          {program.nameRu ?? program.nameEn ?? ""}
        </h1>
        <form
          action={toggleFavoriteProgram.bind(null, program.id)}
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
            <Heart className={`size-4 ${favorited ? "fill-current" : ""}`} />
            {favorited ? "В избранном" : "В избранное"}
          </button>
        </form>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          {/* 参数规格表 */}
          <section>
            <h2 className="text-sm tracking-wide text-muted uppercase">
              Параметры программы
            </h2>
            <div className="mt-3 border-t border-hairline">
              <SpecRow
                label="Уровень"
                value={degreeLevelRu[program.degreeLevel] ?? program.degreeLevel}
              />
              <SpecRow
                label="Язык обучения"
                value={
                  program.teachingLanguages.length
                    ? program.teachingLanguages
                        .map((l) => teachingLanguageRu[l] ?? l)
                        .join(", ")
                    : null
                }
              />
              <SpecRow
                label="Длительность"
                value={program.durationYears ? `${program.durationYears} г.` : null}
              />
              <SpecRow label="Набор" value={program.intake} />
              <SpecRow
                label="Начало"
                value={program.startDate?.toLocaleDateString("ru-RU") ?? null}
              />
              <SpecRow
                label="Дедлайн подачи"
                value={program.applicationDeadline?.toLocaleDateString("ru-RU") ?? null}
              />
            </div>
          </section>

          {/* 申请要求(仅俄文) */}
          {program.requirementsRu && (
            <section className="mt-10">
              <h2 className="text-sm tracking-wide text-muted uppercase">
                Требования
              </h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-ink/80">
                {program.requirementsRu}
              </p>
            </section>
          )}

          {/* 奖学金说明(仅俄文) */}
          {program.scholarshipNoteRu && (
            <section className="mt-10">
              <h2 className="flex items-center gap-2 text-sm tracking-wide text-muted uppercase">
                <GraduationCap className="size-4 text-accent" />
                Стипендии
              </h2>
              <p className="mt-3 leading-relaxed text-ink/80">
                {program.scholarshipNoteRu}
              </p>
              <Link
                href={`/universities/${u.slug}`}
                className="mt-2 inline-flex items-center gap-1 text-sm text-accent underline-offset-4 hover:underline"
              >
                Все стипендии университета <ArrowUpRight className="size-3.5" />
              </Link>
            </section>
          )}
        </div>

        {/* 右栏:费用卡 + 申请 CTA(吸住) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-hairline bg-white p-6">
            <h2 className="text-sm tracking-wide text-muted uppercase">
              Стоимость
            </h2>
            <div className="mt-3">
              <SpecRow
                label="Обучение"
                value={
                  program.tuitionPerYear
                    ? `${formatDual(program.tuitionPerYear, rate)} / год`
                    : null
                }
              />
              <SpecRow
                label="Общежитие"
                value={
                  program.hostelFeePerYear
                    ? `${formatDual(program.hostelFeePerYear, rate)} / год`
                    : null
                }
              />
              <SpecRow
                label="Страховка"
                value={
                  program.insuranceFeePerYear
                    ? `${formatDual(program.insuranceFeePerYear, rate)} / год`
                    : null
                }
              />
              <SpecRow
                label="Взнос за подачу"
                value={
                  program.applicationFee
                    ? formatDual(program.applicationFee, rate)
                    : null
                }
              />
            </div>
            {fx && (
              <p className="mt-4 text-xs text-muted">
                Курс {fx.source}: 1 ¥ ≈ {fx.rate.toFixed(2)} ₽
              </p>
            )}
            {program.lastVerifiedAt && (
              <p className="mt-3 border-t border-hairline pt-3 text-xs text-muted">
                Проверено: {program.lastVerifiedAt.toLocaleDateString("ru-RU")}
              </p>
            )}
          </div>

          {/* 申请按钮:MVP 导流官方通道 */}
          {program.sourceUrl && (
            <a
              href={program.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-4 flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-cream transition-colors hover:bg-accent"
            >
              Подать заявку на официальном сайте
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          )}
        </aside>
      </div>
    </main>
  );
}
