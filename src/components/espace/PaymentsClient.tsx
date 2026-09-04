"use client";

import { useState } from "react";
import { formation } from "@/lib/config/formation";
import type { PaymentDisplayItem } from "@/lib/programme/payments";

export function PaymentsClient({ items }: { items: PaymentDisplayItem[] }) {
  const [loadingKind, setLoadingKind] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(kind: string) {
    setLoadingKind(kind);
    setError(null);
    try {
      const res = await fetch("/api/paiements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Impossible d'initier le paiement.");
        setLoadingKind(null);
        return;
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      setError("URL de paiement non reçue.");
      setLoadingKind(null);
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
      setLoadingKind(null);
    }
  }

  const colors = {
    payé: "text-[#2e5a36] bg-[#e8f5e9]",
    "à venir": "text-[color:var(--accent-darkest)] bg-[color:var(--accent-lightest)]",
    planifié: "text-[color:var(--neutral-600)] bg-[color:var(--neutral-100)]",
  };

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
      <h2 className="font-display text-xl tracking-tight sm:text-2xl">Échéancier</h2>

      {error ? (
        <p className="mt-4 rounded-lg border border-[color:var(--error)]/40 bg-[color:var(--error)]/10 px-3 py-2 text-sm text-[color:var(--error)]">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-[color:var(--neutral-500)]">
          Aucun paiement enregistré pour ton inscription.
        </p>
      ) : (
        <ul className="mt-5 space-y-4 text-sm">
          {items.map((item) => {
            const canPay = item.status === "à venir" && item.kind !== "registration";

            return (
              <li
                key={item.kind}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-[color:var(--neutral-black)]">{item.label}</p>
                  <p className="text-sm font-semibold text-[color:var(--neutral-800)]">{item.amount}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${colors[item.status]}`}>
                    {item.status}
                  </span>

                  {canPay ? (
                    <button
                      type="button"
                      onClick={() => handlePay(item.kind)}
                      disabled={loadingKind === item.kind}
                      className="btn-primary !px-4 !py-2 text-xs !bg-[color:var(--accent)] !text-[color:var(--neutral-black)] hover:!bg-[color:var(--accent-light)] font-medium"
                    >
                      {loadingKind === item.kind ? "Redirection…" : "Payer par Mobile Money"}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 rounded-xl bg-[color:var(--neutral-100)] p-4 text-sm text-[color:var(--neutral-600)]">
        Total formation :{" "}
        <span className="font-semibold text-[color:var(--neutral-black)]">
          {formation.totalPrice.toLocaleString("fr-FR")} {formation.currencyLabel}
        </span>{" "}
        · Paiement sécurisé via FedaPay (MTN, Moov, Celtiis)
      </div>
    </div>
  );
}
