"use client";

import { useState } from "react";

/** Lien d'invitation du groupe WhatsApp, montré aux apprenants après le paiement de la préinscription. */
export function WhatsAppGroupCard({ initialUrl }: { initialUrl: string | null }) {
  const [saved, setSaved] = useState(initialUrl);
  const [value, setValue] = useState(initialUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/whatsapp-group", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = (await res.json()) as { url?: string | null; error?: string };
      if (!res.ok) throw new Error(data.error || "Enregistrement impossible.");
      setSaved(data.url ?? null);
      setMessage({ ok: true, text: data.url ? "Lien enregistré." : "Lien retiré." });
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Enregistrement impossible." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--neutral-500)]">
          Communauté
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            saved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {saved ? "Lien en place" : "Aucun lien"}
        </span>
      </div>
      <h2 className="font-display mt-1 text-xl font-bold tracking-tight">Groupe WhatsApp</h2>
      <p className="mt-1 max-w-xl text-xs text-[color:var(--neutral-600)]">
        Les apprenants voient ce lien sur leur tableau de bord et dans l&apos;email de bienvenue, uniquement après le
        paiement de leur préinscription.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://chat.whatsapp.com/..."
          className="min-w-0 flex-1 rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || value.trim() === (saved ?? "")}
          className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-xs ${message.ok ? "text-emerald-700" : "text-rose-700"}`}>{message.text}</p>
      )}
    </section>
  );
}
