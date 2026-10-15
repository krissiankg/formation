"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatFcfa } from "@/lib/format";
import { getInstallmentLabel, MANUAL_PAYMENT_REF } from "@/lib/programme/installments";
import type { Enrollment, PaymentKind } from "@/lib/types";

const ORDER: PaymentKind[] = ["registration", "start", "month1", "month3"];

/**
 * Échéancier d'un apprenant avec saisie manuelle : « Marquer payé » pour un paiement reçu hors FedaPay
 * (espèces, Mobile Money direct), et « Annuler » pour corriger un marquage manuel.
 */
export function PaymentScheduleControl({ enrollment }: { enrollment: Enrollment }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busyKind, setBusyKind] = useState<PaymentKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firstName = enrollment.fullName.trim().split(/\s+/)[0];
  const payments = ORDER.flatMap((kind) => enrollment.payments.filter((p) => p.kind === kind));

  async function update(kind: PaymentKind, paid: boolean, amount: number) {
    const label = getInstallmentLabel(kind);
    const question = paid
      ? `Confirmer que ${firstName} a payé « ${label} » (${formatFcfa(amount)}) ?\n\nSon accès au cours sera mis à jour et il recevra une confirmation WhatsApp.`
      : `Annuler le paiement manuel « ${label} » de ${firstName} ?\n\nSon accès au cours redeviendra celui de ses autres paiements.`;
    if (!window.confirm(question)) return;

    setBusyKind(kind);
    setError(null);
    try {
      const res = await fetch("/api/admin/enrollments/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: enrollment.id, kind, paid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur");
    } finally {
      setBusyKind(null);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer text-[11px] font-medium text-[color:var(--accent-dark)] hover:underline"
        aria-expanded={open}
      >
        {open ? "Masquer l'échéancier ▴" : "Gérer les paiements ▾"}
      </button>

      {open ? (
        <ul className="mt-2 space-y-1.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-2">
          {payments.map((p) => {
            const manual = p.status === "paid" && p.fedapayId === MANUAL_PAYMENT_REF;
            return (
              <li key={p.kind} className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px]">
                <span className="min-w-0">
                  <span className="font-medium text-[color:var(--neutral-black)]">{getInstallmentLabel(p.kind)}</span>
                  <span className="text-[color:var(--neutral-500)]"> · {formatFcfa(p.amount)}</span>
                </span>
                {p.status === "paid" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="rounded-full bg-[#e8f5e9] px-2 py-0.5 font-medium text-[#2e5a36]">
                      ✓ payé{manual ? " (manuel)" : ""}
                    </span>
                    {manual ? (
                      <button
                        type="button"
                        disabled={busyKind !== null}
                        onClick={() => update(p.kind, false, p.amount)}
                        className="cursor-pointer text-[color:var(--neutral-500)] hover:text-[color:var(--error)] hover:underline disabled:opacity-50"
                      >
                        Annuler
                      </button>
                    ) : null}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={busyKind !== null}
                    onClick={() => update(p.kind, true, p.amount)}
                    className="cursor-pointer whitespace-nowrap rounded-lg border border-[color:var(--accent)] bg-[color:var(--neutral-50)] px-2 py-1 font-medium text-[color:var(--accent-dark)] transition hover:bg-[color:var(--accent-lightest)] disabled:opacity-50"
                  >
                    {busyKind === p.kind ? "Enregistrement…" : "Marquer payé"}
                  </button>
                )}
              </li>
            );
          })}
          {error ? <li className="text-[11px] text-[color:var(--error)]">❌ {error}</li> : null}
        </ul>
      ) : null}
    </div>
  );
}
