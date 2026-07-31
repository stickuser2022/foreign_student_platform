import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold">Учёба в Китае</h1>
      <p className="text-lg text-gray-600">
        Информационная платформа для российских студентов: университеты,
        программы, стипендии и поступление в вузы Китая.
      </p>
      <div className="flex gap-4">
        <Link
          href="/universities"
          className="rounded bg-blue-600 px-5 py-2 text-white"
        >
          Каталог университетов
        </Link>
        <Link
          href="/sign-up"
          className="rounded border border-blue-600 px-5 py-2 text-blue-600"
        >
          Регистрация
        </Link>
        <Link
          href="/scholarships"
          className="rounded border border-blue-600 px-5 py-2 text-blue-600"
        >
          Стипендии
        </Link>
      </div>
    </main>
  );
}
