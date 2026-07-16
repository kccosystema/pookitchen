"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-bold">Blog Hub — sign in</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          autoFocus
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
