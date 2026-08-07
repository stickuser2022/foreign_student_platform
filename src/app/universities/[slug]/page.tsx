import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
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

function range(values: (number | null)[]): [number, number] | null {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

function formatRange(
  r: [number, number] | null,
  suffix: string,
  rate: number | null
): string | null {
  if (!r) return null;
  const [min, max] = r;
  if (min === max) return `${formatDual(min, rate)} ${suffix}`;
  return `${formatDual(min, rate)} – ¥${max.toLocaleString("ru-RU")} ${suffix}`;
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
  if (university.isDoubleFirstClass) badges.push("双一流");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* 1. 头部 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          {university.nameRu ?? university.nameEn ?? university.nameZh}
        </h1>
        <p className="mt-1 text-lg text-gray-500">{university.nameZh}</p>
        <p className="mt-2 text-gray-600">
          {university.province} · {university.city} ·{" "}
          {universityTypeRu[university.universityType] ?? university.universityType}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="rounded bg-amber-100 px-2 py-0.5 text-sm">
              {b}
            </span>
          ))}
          {university.website && (
            <a
              href={university.website}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-blue-50 px-2 py-0.5 text-sm text-blue-700 underline"
            >
              Официальный сайт ↗
            </a>
          )}
        </div>
        {/* 收藏按钮:未登录点击 → 引导注册 */}
        <form action={toggleFavoriteUniversity.bind(null, university.id)} className="mt-4">
          <button
            type="submit"
            className={`rounded border px-4 py-1.5 text-sm ${
              favorited
                ? "border-red-300 bg-red-50 text-red-600"
                : "border-gray-300 text-gray-600 hover:border-red-300"
            }`}
          >
            {favorited ? "♥ В избранном" : "♡ В избранное"}
          </button>
        </form>
      </header>

      {/* 2. 费用速览卡 */}
      <section className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h2 className="mb-3 text-xl font-semibold">💰 Стоимость (кратко)</h2>
        <ul className="space-y-1 text-gray-800">
          {tuition && <li>Обучение: {formatRange(tuition, "/ год", rate)}</li>}
          {hostel && <li>Общежитие: {formatRange(hostel, "/ год", rate)}</li>}
          {insurance && <li>Страховка: {formatRange(insurance, "/ год", rate)}</li>}
          {university.livingCostPerMonth && (
            <li>
              Прожиточные расходы: {formatDual(university.livingCostPerMonth, rate)} / месяц
            </li>
          )}
        </ul>
        {fx && (
          <p className="mt-3 text-xs text-gray-500">
            Курс {fx.source}: 1 ¥ ≈ {fx.rate.toFixed(2)} ₽
          </p>
        )}
      </section>

      {/* 3. 简介 + 优势学科 */}
      {university.descriptionRu || university.descriptionZh ? (
        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">Об университете</h2>
          <p className="text-gray-700">
            {university.descriptionRu ?? university.descriptionZh}
          </p>
        </section>
      ) : null}
      {university.strongDisciplines.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">Сильные направления</h2>
          <div className="flex flex-wrap gap-2">
            {university.strongDisciplines.map((d) => (
              <span
                key={d}
                className="rounded-full bg-green-100 px-3 py-1 text-sm"
              >
                {d}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 4. 项目列表 */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">
          Программы ({university.programs.length})
        </h2>
        <ul className="grid gap-4">
          {university.programs.map((p) => (
            <li key={p.id}>
              <Link
                href={`/programs/${p.id}`}
                className="block rounded-lg border p-4 transition hover:border-blue-400 hover:shadow"
              >
                <h3 className="font-semibold">{p.nameRu ?? p.nameZh}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {degreeLevelRu[p.degreeLevel] ?? p.degreeLevel}
                  {p.durationYears ? ` · ${p.durationYears} г.` : ""} ·{" "}
                  {p.teachingLanguages
                    .map((l) => teachingLanguageRu[l] ?? l)
                    .join(", ")}
                </p>
                {p.tuitionPerYear && (
                  <p className="mt-1 text-sm">
                    Обучение: {formatDual(p.tuitionPerYear, rate)} / год
                  </p>
                )}
                {p.scholarshipNote && (
                  <p className="mt-1 text-sm text-green-700">🎓 {p.scholarshipNote}</p>
                )}
                {p.applicationDeadline && (
                  <p className="mt-1 text-sm text-red-600">
                    Дедлайн: {p.applicationDeadline.toLocaleDateString("ru-RU")}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. 奖学金(本校 + 平台级) */}
      {allScholarships.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">Стипендии</h2>
          <ul className="space-y-3">
            {allScholarships.map((s) => (
              <li key={s.id} className="rounded-lg border p-4">
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-sm text-gray-600">
                  {scholarshipTypeRu[s.type] ?? s.type}
                </p>
                {s.coverage && <p className="mt-1 text-sm">Покрывает: {s.coverage}</p>}
                {s.deadline && (
                  <p className="mt-1 text-sm text-red-600">
                    Дедлайн: {s.deadline.toLocaleDateString("ru-RU")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 6. 核实标记 */}
      {university.lastVerifiedAt && (
        <p className="mb-8 text-xs text-gray-400">
          Информация проверена:{" "}
          {university.lastVerifiedAt.toLocaleDateString("ru-RU")}
          {university.sourceUrl && (
            <>
              {" · "}
              <a
                href={university.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Источник
              </a>
            </>
          )}
        </p>
      )}

      <Link href="/universities" className="text-blue-600 underline">
        ← Все университеты
      </Link>
    </main>
  );
}
