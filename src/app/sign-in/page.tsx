"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/modules/auth/client";

// 输入框:下划线极简风(与全站筛选器一致)
const inputCls =
  "w-full border-b border-hairline bg-transparent py-2.5 outline-none transition-colors focus:border-ink placeholder:text-muted";
const labelCls = "text-xs tracking-wide text-muted uppercase";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Ошибка входа");
      return;
    }
    router.push("/universities");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="font-serif text-4xl font-light tracking-tight">Вход</h1>
      <p className="mt-2 text-sm text-muted">С возвращением.</p>
      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
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
            placeholder="········"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-ink py-3 text-cream transition-colors hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Загрузка…" : "Войти"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Нет аккаунта?{" "}
        <Link
          href="/sign-up"
          className="text-ink underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          Зарегистрироваться
        </Link>
      </p>
    </main>
  );
}
