import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgramById } from "@/modules/programs/service";
import {
  degreeLevelRu,
  teachingLanguageRu,
} from "@/modules/universities/labels";
import { formatDual } from "@/shared/money";

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-4 text-gray-500">{label}</td>
      <td className="py-2 font-medium">{value}</td>
    </tr>
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

  const u = program.university;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{program.nameRu ?? program.nameZh}</h1>
        <p className="mt-2">
          <Link
            href={`/universities/${u.slug}`}
            className="text-blue-600 underline"
          >
            {u.nameRu ?? u.nameZh}
          </Link>
          <span className="text-gray-500">
            {" "}
            · {u.province} · {u.city}
          </span>
        </p>
      </header>

      {/* 1. 参数表 */}
      <section className="mb-8 rounded-lg border p-5">
        <h2 className="mb-3 text-xl font-semibold">Параметры программы</h2>
        <table className="w-full text-left">
          <tbody>
            <Row
              label="Уровень"
              value={degreeLevelRu[program.degreeLevel] ?? program.degreeLevel}
            />
            <Row
              label="Язык обучения"
              value={program.teachingLanguages
                .map((l) => teachingLanguageRu[l] ?? l)
                .join(", ")}
            />
            <Row
              label="Длительность"
              value={program.durationYears ? `${program.durationYears} г.` : null}
            />
            <Row label="Набор" value={program.intake} />
            <Row
              label="Начало"
              value={program.startDate?.toLocaleDateString("ru-RU") ?? null}
            />
            <Row
              label="Дедлайн подачи"
              value={program.applicationDeadline?.toLocaleDateString("ru-RU") ?? null}
            />
          </tbody>
        </table>
      </section>

      {/* 2. 费用表 */}
      <section className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h2 className="mb-3 text-xl font-semibold">💰 Стоимость</h2>
        <table className="w-full text-left">
          <tbody>
            <Row
              label="Обучение"
              value={program.tuitionPerYear ? `${formatDual(program.tuitionPerYear)} / год` : null}
            />
            <Row
              label="Общежитие"
              value={program.hostelFeePerYear ? `${formatDual(program.hostelFeePerYear)} / год` : null}
            />
            <Row
              label="Страховка"
              value={program.insuranceFeePerYear ? `${formatDual(program.insuranceFeePerYear)} / год` : null}
            />
            <Row
              label="Взнос за подачу"
              value={program.applicationFee ? formatDual(program.applicationFee) : null}
            />
          </tbody>
        </table>
        <p className="mt-3 text-xs text-gray-500">Курс: 1 ¥ ≈ 11 ₽ (ориентировочно)</p>
      </section>

      {/* 3. 奖学金说明 */}
      {program.scholarshipNote && (
        <section className="mb-8 rounded-lg border border-green-200 bg-green-50 p-5">
          <h2 className="mb-2 text-xl font-semibold">🎓 Стипендии</h2>
          <p className="text-gray-800">{program.scholarshipNote}</p>
          <Link
            href={`/universities/${u.slug}`}
            className="mt-2 inline-block text-sm text-blue-600 underline"
          >
            Все стипендии университета →
          </Link>
        </section>
      )}

      {/* 4. 申请要求 */}
      {program.requirements && (
        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">Требования</h2>
          <p className="whitespace-pre-line text-gray-700">{program.requirements}</p>
        </section>
      )}

      {/* 5. 申请按钮:MVP 导流官方通道 */}
      {program.sourceUrl && (
        <section className="mb-8">
          <a
            href={program.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded bg-blue-600 px-6 py-3 text-white"
          >
            Подать заявку на официальном сайте ↗
          </a>
        </section>
      )}

      {/* 6. 核实标记 */}
      {program.lastVerifiedAt && (
        <p className="mb-8 text-xs text-gray-400">
          Информация проверена: {program.lastVerifiedAt.toLocaleDateString("ru-RU")}
        </p>
      )}

      <Link href={`/universities/${u.slug}`} className="text-blue-600 underline">
        ← {u.nameRu ?? u.nameZh}
      </Link>
    </main>
  );
}
