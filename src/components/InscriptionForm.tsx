"use client";

import Link from "next/link";
import { useState, useTransition, type ChangeEvent } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { WhatsAppLink } from "@/components/WhatsAppFloat";
import { formation, openSlots } from "@/lib/config/formation";
import type { ScheduleId } from "@/lib/types";
import { formatFcfa } from "@/lib/format";
import type { Seats } from "@/lib/enrollment/seats";
import { seatsLabel } from "@/lib/landing";
import { SignupSteps } from "@/components/inscription/SignupSteps";

type InscriptionState = {
  fullName: string;
  email: string;
  whatsapp: string;
  schedule: ScheduleId;
  acceptTerms: boolean;
  password: string;
};

export function InscriptionForm({ seats }: { seats: Seats }) {
  const firstOpen = openSlots.find((slot) => !seats[slot.id].full)?.id ?? openSlots[0].id;
  const allFull = openSlots.every((slot) => seats[slot.id].full);
  const [form, setForm] = useState<InscriptionState>({
    fullName: "",
    email: "",
    whatsapp: "",
    schedule: firstOpen,
    acceptTerms: false,
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

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
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue lors de l'inscription.");
        setLoading(false);
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      // Compte créé mais paiement indisponible pour l'instant : on réessaie depuis la page de paiement.
      if (data.redirectTo) {
        startTransition(() => {
          window.location.assign(data.redirectTo);
        });
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
      <SignupSteps current={1} />
      <Field
        label="Nom complet"
        value={form.fullName}
        onChange={(v) => setForm((s) => ({ ...s, fullName: v }))}
        placeholder="Jean Dupont"
        autoComplete="name"
        required
      />
      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => setForm((s) => ({ ...s, email: v }))}
        placeholder="toi@email.com"
        autoComplete="email"
        required
      />
      <Field
        label="Numéro WhatsApp"
        type="tel"
        value={form.whatsapp}
        onChange={(v) => setForm((s) => ({ ...s, whatsapp: v }))}
        placeholder="+229 01 XX XX XX XX"
        hint="Pour te contacter et t'ajouter au groupe WhatsApp de la formation."
        autoComplete="tel"
        required
      />
      {/* Un seul champ : l'œil permet de relire le mot de passe, inutile de le taper deux fois. */}
      <Field
        label="Choisis un mot de passe"
        type="password"
        value={form.password}
        onChange={(v) => setForm((s) => ({ ...s, password: v }))}
        placeholder="8 caractères minimum"
        hint="Il te servira à entrer dans ton espace apprenant."
        required
      />

      {openSlots.length === 1 ? (
        <div className="rounded-xl border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] p-4">
          <p className="text-sm font-medium text-[color:var(--neutral-black)]">Ta classe</p>
          <p className="mt-1 font-display text-lg text-[color:var(--accent-darkest)]">
            {openSlots[0].label} · {openSlots[0].hours}
          </p>
          <p className="mt-1 text-sm text-[color:var(--neutral-600)]">
            {formation.sessionsCount} séances, du {formation.startLabel} au {formation.endLabel}
            {seatsLabel(seats[openSlots[0].id]) ? ` · ${seatsLabel(seats[openSlots[0].id])}` : ""}
          </p>
          <p className="mt-2 text-xs text-[color:var(--neutral-600)]">
            Pas libre à cet horaire ?{" "}
            <WhatsAppLink className="accent-text font-semibold underline">Écris-nous sur WhatsApp</WhatsAppLink>
          </p>
        </div>
      ) : (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-[color:var(--neutral-black)]">
            Ta classe (créneau de formation)
          </legend>
          <p className="mb-3 text-xs leading-relaxed text-[color:var(--neutral-600)]">{formation.classPolicy}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {openSlots.map((slot) => {
              const selected = form.schedule === slot.id;
              const { full } = seats[slot.id];
              return (
                <label
                  key={slot.id}
                  className={`rounded-xl border p-4 transition ${
                    full
                      ? "cursor-not-allowed border-[color:var(--border)] bg-[color:var(--neutral-100)] opacity-60"
                      : selected
                        ? "cursor-pointer border-[color:var(--accent)] bg-[color:var(--accent-lightest)]"
                        : "cursor-pointer border-[color:var(--border)] bg-[color:var(--neutral-50)] hover:border-[color:var(--accent)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule"
                    className="sr-only"
                    checked={selected}
                    disabled={full}
                    onChange={() => setForm((s) => ({ ...s, schedule: slot.id }))}
                  />
                  <p className="font-medium text-[color:var(--neutral-black)]">{slot.label}</p>
                  <p className="mt-1 text-sm accent-text">{slot.hours}</p>
                  <p
                    className={`mt-2 text-xs font-medium ${full ? "text-[color:var(--error)]" : "text-[color:var(--neutral-500)]"}`}
                  >
                    {seatsLabel(seats[slot.id]) ?? "Places disponibles"}
                  </p>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      {allFull ? (
        <p className="text-sm text-[color:var(--error)]">
          La classe est complète. Écris-nous sur WhatsApp pour être sur la liste d&apos;attente.
        </p>
      ) : null}

      {/* ── Récapitulatif paiement ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-4 text-sm text-[color:var(--neutral-600)]">
        <p className="font-medium text-[color:var(--neutral-black)]">Plan de paiement</p>
        <ul className="mt-3 space-y-2">
          <li className="flex justify-between gap-3">
            <span>Préinscription (maintenant)</span>
            <span className="font-medium text-[color:var(--neutral-black)]">
              {formatFcfa(formation.registrationFee)}
            </span>
          </li>
          {formation.installments.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>{item.label}</span>
              <span className="text-[color:var(--neutral-black)]">{formatFcfa(item.amount)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-3 border-t border-[color:var(--border)] pt-2 font-medium text-[color:var(--neutral-black)]">
            <span>Total formation</span>
            <span>{formatFcfa(formation.totalPrice)}</span>
          </li>
        </ul>
        <p className="mt-3 border-t border-[color:var(--border)] pt-3 text-xs leading-relaxed">
          {formation.refundGuarantee}
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-[color:var(--neutral-600)]">
        <input
          type="checkbox"
          className="mt-1"
          checked={form.acceptTerms}
          onChange={(e) => setForm((s) => ({ ...s, acceptTerms: e.target.checked }))}
        />
        <span>
          Je m&apos;engage à payer {formatFcfa(formation.registrationFee)} de préinscription pour réserver ma place
          (non remboursables si je change d&apos;avis) et j&apos;accepte les{" "}
          <Link href="/condition" target="_blank" className="accent-text underline">
            conditions d&apos;utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/politique" target="_blank" className="accent-text underline">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>

      {error ? (
        <p className="rounded-lg border border-[color:var(--error)]/40 bg-[color:var(--error)]/10 px-3 py-2 text-sm text-[color:var(--error)]">
          {error}
        </p>
      ) : null}

      <div>
        <button type="submit" className="btn-primary w-full" disabled={loading || allFull}>
          {loading ? "Traitement en cours…" : `Créer mon compte et payer (${formatFcfa(formation.registrationFee)})`}
        </button>
        <p className="mt-2 text-center text-xs text-[color:var(--neutral-500)]">
          Paiement par Mobile Money, sécurisé par FedaPay
        </p>
      </div>
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
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  autoComplete?: string;
}) {
  const inputProps = {
    value,
    required,
    placeholder,
    onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    className:
      "w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-4 py-3 text-[color:var(--neutral-black)] outline-none transition focus:border-[color:var(--accent)]",
  };

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[color:var(--neutral-black)]">
        {label}
      </span>
      {type === "password" ? (
        <PasswordInput autoComplete="new-password" {...inputProps} />
      ) : (
        <input type={type} autoComplete={autoComplete} {...inputProps} />
      )}
      {hint ? (
        <span className="mt-1.5 block text-xs text-[color:var(--neutral-500)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
