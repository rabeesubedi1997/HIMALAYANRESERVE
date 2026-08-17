"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Login failed.");
        setBusy(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  };

  const field =
    "w-full border border-white/30 bg-ink-lift px-4 py-3.5 text-sm text-paper placeholder:text-[#a29c90] transition-colors duration-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-ink px-6">
      <form
        onSubmit={submit}
        className="flex w-full max-w-sm flex-col gap-5 rounded-[2px] border border-white/25 bg-[#19191d] p-8"
      >
        <div className="flex flex-col gap-2">
          <span className="font-display text-2xl font-semibold tracking-[0.32em] text-paper">
            HIMALAYAN <span className="gold-text">RESERVE</span>
          </span>
          <span className="text-xs uppercase tracking-[0.28em] text-paper-faint">Admin Console</span>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-[0.65rem] uppercase tracking-[0.24em] text-gold">Username</span>
          <input
            className={field}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[0.65rem] uppercase tracking-[0.24em] text-gold">Password</span>
          <input
            type="password"
            className={field}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="text-sm text-seal">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="bg-gold px-6 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-ink transition-colors duration-300 hover:bg-paper disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>

        <Link href="/" className="text-center text-xs text-paper-faint transition-colors hover:text-gold">
          ← Back to site
        </Link>
      </form>
    </div>
  );
}