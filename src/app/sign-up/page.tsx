"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/modules/auth/client";

const inputCls =
  "w-full border-b border-hairline bg-transparent py-2.5 outline-none transition-colors focus:border-ink placeholder:text-muted";
const labelCls = "text-xs tracking-wide text-muted uppercase";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await authClient.signUp.email({ name, email, password });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Ошибка регистрации");
      return;
    }
    router.push("/universities");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="font-serif text-4xl font-light tracking-tight">
        Регистрация
      </h1>
      <p className="mt-2 text-sm text-muted">
        Бесплатно. Сохраняйте университеты и программы в избранное.
      </p>
      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Имя</span>
          <input
            className={inputCls}
            placeholder="Иван"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Email</span>
          <input
            className={inputCls}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Пароль</span>
          <input
            className={inputCls}
            type="password"
            placeholder="минимум 8 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-ink py-3 text-cream transition-colors hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Загрузка…" : "Создать аккаунт"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link
          href="/sign-in"
          className="text-ink underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          Войти
        </Link>
      </p>
    </main>
  );
}
