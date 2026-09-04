"use client";

import { useState, useTransition } from "react";
import { formation } from "@/lib/config/formation";
import type { ScheduleId } from "@/lib/types";
import { formatFcfa } from "@/lib/format";

type InscriptionState = {
  fullName: string;
  email: string;
  whatsapp: string;
  schedule: ScheduleId;
  acceptTerms: boolean;
  promoCode: string;
};

export function InscriptionForm() {
  const [form, setForm] = useState<InscriptionState>({
    fullName: "",
    email: "",
    whatsapp: "",
    schedule: "saturday",
    acceptTerms: false,
    promoCode: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [promoChecked, setPromoChecked] = useState<"idle" | "valid" | "invalid">("idle");
  const [, startTransition] = useTransition();

  const promoApplied = promoChecked === "valid";

  async function checkPromo() {
    const code = form.promoCode.trim();
    if (!code) return;
    try {
      const res = await fetch("/api/inscriptions/check-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: code }),
      });
      const data = (await res.json()) as { valid?: boolean };
      if (data.valid) {
        setPromoChecked("valid");
        setError(null);
      } else {
        setPromoChecked("invalid");
      }
    } catch {
      setPromoChecked("invalid");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.acceptTerms) {
      setError("Tu dois accepter les conditions pour continuer.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/inscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          whatsapp: form.whatsapp,
          schedule: form.schedule,
          acceptTerms: form.acceptTerms,
          promoCode: promoApplied ? form.promoCode.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue lors de l'inscription.");
        setLoading(false);
        return;
      }

      if (data.promoApplied) {
        startTransition(() => {
          window.location.href = `/inscription/confirmation?id=${data.enrollmentId}&promo=1`;
        });
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      setError("Impossible d'initialiser le paiement.");
      setLoading(false);
    } catch {
      setError("Erreur réseau. Vérifie ta connexion et réessaie.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Field
        label="Nom complet"
        value={form.fullName}
        onChange={(v) => setForm((s) => ({ ...s, fullName: v }))}
        placeholder="Jean Dupont"
        required
      />
      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => setForm((s) => ({ ...s, email: v }))}
        placeholder="toi@email.com"
        required
      />
      <Field
        label="Numéro WhatsApp"
        value={form.whatsapp}
        onChange={(v) => setForm((s) => ({ ...s, whatsapp: v }))}
        placeholder="+229 XX XX XX XX"
        hint="Obligatoire pour recevoir les alertes de nouveaux contenus."
        required
      />

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-[color:var(--neutral-black)]">
          Créneau de formation
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.values(formation.schedule).map((slot) => {
            const selected = form.schedule === slot.id;
            return (
              <label
                key={slot.id}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  selected
                    ? "border-[color:var(--accent)] bg-[color:var(--accent-lightest)]"
                    : "border-[color:var(--border)] bg-[color:var(--neutral-50)] hover:border-[color:var(--accent)]"
                }`}
              >
                <input
                  type="radio"
                  name="schedule"
                  className="sr-only"
                  checked={selected}
                  onChange={() => setForm((s) => ({ ...s, schedule: slot.id }))}
                />
                <p className="font-medium text-[color:var(--neutral-black)]">
                  {slot.label}
                </p>
                <p className="mt-1 text-sm accent-text">{slot.hours}</p>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* ── Code promo (discret sans exemple affiché) ─────────────────────────── */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[color:var(--neutral-black)]">
          Code promo <span className="font-normal text-[color:var(--neutral-500)]">(facultatif)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.promoCode}
            onChange={(v) => {
              setForm((s) => ({ ...s, promoCode: v.target.value }));
              setPromoChecked("idle");
            }}
            placeholder="Entrez votre code"
            className="flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-4 py-3 text-[color:var(--neutral-black)] uppercase outline-none transition focus:border-[color:var(--accent)]"
          />
          <button
            type="button"
            onClick={checkPromo}
            disabled={!form.promoCode.trim() || loading}
            className="btn-ghost shrink-0"
          >
            Appliquer
          </button>
        </div>
        {promoChecked === "valid" && (
          <p className="text-sm font-medium text-green-600">
            ✓ Code valide — frais d&apos;inscription offerts !
          </p>
        )}
        {promoChecked === "invalid" && (
          <p className="text-sm text-[color:var(--error)]">
            Code promo invalide.
          </p>
        )}
      </div>

      {/* ── Récapitulatif paiement ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-4 text-sm text-[color:var(--neutral-600)]">
        <p className="font-medium text-[color:var(--neutral-black)]">
          Plan de paiement
        </p>
        <ul className="mt-3 space-y-2">
          <li className="flex justify-between gap-3">
            <span>Frais d&apos;inscription (maintenant)</span>
            {promoApplied ? (
              <span className="font-medium text-green-600">
                <s className="mr-1 text-[color:var(--neutral-400)]">{formatFcfa(formation.registrationFee)}</s>
                Offerts
              </span>
            ) : (
              <span className="text-[color:var(--neutral-black)]">
                {formatFcfa(formation.registrationFee)}
              </span>
            )}
          </li>
          {formation.installments.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>{item.label}</span>
              <span className="text-[color:var(--neutral-black)]">
                {formatFcfa(item.amount)}
              </span>
            </li>
          ))}
          <li className="flex justify-between gap-3 border-t border-[color:var(--border)] pt-2 font-medium text-[color:var(--neutral-black)]">
            <span>Total formation</span>
            <span>{formatFcfa(formation.totalPrice)}</span>
          </li>
        </ul>
      </div>

      <label className="flex items-start gap-3 text-sm text-[color:var(--neutral-600)]">
        <input
          type="checkbox"
          className="mt-1"
          checked={form.acceptTerms}
          onChange={(e) =>
            setForm((s) => ({ ...s, acceptTerms: e.target.checked }))
          }
        />
        <span>
          Je confirme mon choix de créneau et je m&apos;engage à payer{" "}
          {promoApplied ? "0 FCFA" : formatFcfa(formation.registrationFee)} pour réserver ma place.
        </span>
      </label>

      {error ? (
        <p className="rounded-lg border border-[color:var(--error)]/40 bg-[color:var(--error)]/10 px-3 py-2 text-sm text-[color:var(--error)]">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading
          ? "Traitement en cours…"
          : promoApplied
            ? "Confirmer mon inscription (0 FCFA)"
            : `Payer ${formatFcfa(formation.registrationFee)} et s'inscrire`}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[color:var(--neutral-black)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-4 py-3 text-[color:var(--neutral-black)] outline-none transition focus:border-[color:var(--accent)]"
      />
      {hint ? (
        <span className="mt-1.5 block text-xs text-[color:var(--neutral-500)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
