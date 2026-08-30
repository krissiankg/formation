"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";

type FormState = {
  fullName: string;
  email: string;
  whatsapp: string;
  schedule: "saturday" | "sunday" | "";
  acceptTerms: boolean;
};

const initial: FormState = {
  fullName: "",
  email: "",
  whatsapp: "",
  schedule: "",
  acceptTerms: false,
};

export function InscriptionForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.schedule) {
      setError("Choisis ton créneau (samedi ou dimanche).");
      return;
    }
    if (!form.acceptTerms) {
      setError("Accepte les conditions pour continuer.");
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
          acceptTerms: true,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        paymentUrl?: string;
        enrollmentId?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Impossible de créer l'inscription.");
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      router.push(`/inscription/confirmation?id=${data.enrollmentId}`);
    } catch {
      setError("Erreur réseau. Réessaie dans un instant.");
    } finally {
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

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-4 text-sm text-[color:var(--neutral-600)]">
        <p className="font-medium text-[color:var(--neutral-black)]">
          Plan de paiement
        </p>
        <ul className="mt-3 space-y-2">
          <li className="flex justify-between gap-3">
            <span>Frais d&apos;inscription (maintenant)</span>
            <span className="text-[color:var(--neutral-black)]">
              {formatFcfa(formation.registrationFee)}
            </span>
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
          {formatFcfa(formation.registrationFee)} pour réserver ma place.
        </span>
      </label>

      {error ? (
        <p className="rounded-lg border border-[color:var(--error)]/40 bg-[color:var(--error)]/10 px-3 py-2 text-sm text-[color:var(--error)]">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading
          ? "Préparation du paiement…"
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
