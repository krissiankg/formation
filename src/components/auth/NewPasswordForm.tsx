"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";

const inputClass =
  "w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]";

export function NewPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, passwordConfirm }),
      });
      const data = (await res.json()) as { redirectTo?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Impossible d'enregistrer le mot de passe.");
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

  if (!token) {
    return (
      <p className="text-sm text-[color:var(--neutral-600)]">
        Ce lien est incomplet.{" "}
        <Link href="/mot-de-passe-oublie" className="accent-text hover:underline">
          Demande un nouveau lien
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[color:var(--neutral-black)]">Nouveau mot de passe</span>
        <PasswordInput
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8 caractères minimum"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[color:var(--neutral-black)]">Confirme le mot de passe</span>
        <PasswordInput
          required
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className={inputClass}
        />
      </label>
      {error ? (
        <p className="text-sm text-[color:var(--error)]">
          {error}{" "}
          {error.includes("lien") ? (
            <Link href="/mot-de-passe-oublie" className="font-semibold underline">
              Nouveau lien
            </Link>
          ) : null}
        </p>
      ) : null}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Enregistrement…" : "Enregistrer et me connecter"}
      </button>
    </form>
  );
}
