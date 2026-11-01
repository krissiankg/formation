"use client";

import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Erreur réseau. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4" role="status">
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Si un compte existe avec <strong>{email}</strong>, un email vient d&apos;être envoyé avec un lien pour choisir ton
          mot de passe. Pense à regarder dans les spams. Le lien est valable 1 heure.
        </p>
        <Link href="/connexion" className="btn-ghost">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[color:var(--neutral-black)]">Email de ton compte</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="toi@email.com"
          className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]"
        />
      </label>
      {error ? <p className="text-sm text-[color:var(--error)]">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Envoi…" : "Recevoir le lien"}
      </button>
      <p className="text-center text-sm text-[color:var(--neutral-600)]">
        <Link href="/connexion" className="accent-text hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
