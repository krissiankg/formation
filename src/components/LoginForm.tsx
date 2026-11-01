"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsPassword(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        error?: string;
        redirectTo?: string;
        needsPassword?: boolean;
      };

      if (!res.ok) {
        setError(data.error ?? "Connexion impossible.");
        setNeedsPassword(Boolean(data.needsPassword));
        return;
      }

      router.push(data.redirectTo ?? "/espace");
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
          Email
        </span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="toi@email.com"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-2 flex items-baseline justify-between text-sm font-medium text-[color:var(--neutral-black)]">
          Mot de passe
          <Link href="/mot-de-passe-oublie" className="text-xs font-normal accent-text hover:underline">
            Mot de passe oublié ?
          </Link>
        </span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>

      {error ? (
        <div className="rounded-lg border border-[color:var(--error)]/40 bg-[color:var(--error)]/10 px-3 py-2 text-sm text-[color:var(--error)]">
          <p>{error}</p>
          {needsPassword ? (
            <Link href="/mot-de-passe-oublie" className="mt-1 inline-block font-semibold underline">
              Créer mon mot de passe
            </Link>
          ) : null}
        </div>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Connexion…" : "Se connecter"}
      </button>

      <p className="rounded-xl bg-[color:var(--neutral-100)] px-4 py-3 text-xs leading-relaxed text-[color:var(--neutral-600)]">
        Première connexion depuis la mise à jour ?{" "}
        <Link href="/mot-de-passe-oublie" className="font-semibold accent-text hover:underline">
          Crée ton mot de passe
        </Link>{" "}
        avec ton email : tu reçois un lien en quelques secondes.
      </p>

      <p className="text-center text-sm text-[color:var(--neutral-600)]">
        Pas encore inscrit ?{" "}
        <Link href="/inscription" className="accent-text hover:underline">
          Créer mon compte
        </Link>
      </p>
    </form>
  );
}
