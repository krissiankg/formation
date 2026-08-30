"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Connexion impossible.");
        return;
      }

      const next = searchParams.get("next");
      const safeNext =
        next && next.startsWith("/admin") && !next.startsWith("/admin/connexion")
          ? next
          : data.redirectTo ?? "/admin";

      router.push(safeNext);
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[color:var(--neutral-black)]">
          Email administrateur
        </span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[color:var(--neutral-black)]">
          Mot de passe
        </span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]"
        />
      </label>

      {error ? (
        <p className="rounded-lg border border-[color:var(--error)]/40 bg-[color:var(--error)]/10 px-3 py-2 text-sm text-[color:var(--error)]">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Connexion…" : "Accéder à l'administration"}
      </button>

      <p className="text-center text-sm text-[color:var(--neutral-600)]">
        <Link href="/" className="accent-text hover:underline">
          ← Retour au site public
        </Link>
      </p>
    </form>
  );
}
