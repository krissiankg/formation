"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, whatsapp }),
      });
      const data = (await res.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Connexion impossible.");
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="toi@email.com"
          className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[color:var(--neutral-black)]">
          Numéro WhatsApp
        </span>
        <input
          type="tel"
          required
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+229 XX XX XX XX"
          className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]"
        />
        <span className="mt-1.5 block text-xs text-[color:var(--neutral-500)]">
          Utilise le même numéro que lors de ton inscription.
        </span>
      </label>

      {error ? (
        <p className="rounded-lg border border-[color:var(--error)]/40 bg-[color:var(--error)]/10 px-3 py-2 text-sm text-[color:var(--error)]">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-center text-sm text-[color:var(--neutral-600)]">
        Pas encore inscrit ?{" "}
        <Link href="/inscription" className="accent-text hover:underline">
          Créer mon compte
        </Link>
      </p>
    </form>
  );
}
