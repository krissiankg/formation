"use client";

import { useState } from "react";
import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import type { Enrollment } from "@/lib/types";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";

export function EnrollmentRow({
  enrollment,
  compact = false,
  onGrantCoins,
}: {
  enrollment: Enrollment;
  compact?: boolean;
  onGrantCoins?: (student: { id: string; name: string }) => void;
}) {
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const reg = enrollment.payments.find((p) => p.kind === "registration");
  const paid = reg?.status === "paid";

  async function handleRemind(type: "registration" | "payment") {
    setSending(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/whatsapp/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: enrollment.id, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'envoi");
      setStatusMsg("✅ Envoyé");
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err: any) {
      setStatusMsg(`❌ ${err.message || "Erreur"}`);
      setTimeout(() => setStatusMsg(null), 3500);
    } finally {
      setSending(false);
    }
  }

  const cleanDigits = enrollment.whatsapp.replace(/\D/g, "");
  const waDigits = cleanDigits.length === 8 ? `229${cleanDigits}` : cleanDigits;
  const waLink = `https://wa.me/${waDigits}`;

  if (compact) {
    return (
      <li className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-[color:var(--neutral-black)]">
            {enrollment.fullName}
          </p>
          <p className="truncate text-xs text-[color:var(--neutral-500)]">{enrollment.email}</p>
        </div>
        <PaymentStatusBadge paid={paid} />
      </li>
    );
  }

  return (
    <tr className="border-t border-[color:var(--border)] transition hover:bg-[color:var(--neutral-100)]/80">
      <td className="px-4 py-4">
        <div className="font-medium text-[color:var(--neutral-black)]">{enrollment.fullName}</div>
        <div className="text-xs text-[color:var(--neutral-500)]">{enrollment.email}</div>
      </td>
      <td className="px-4 py-4 text-sm font-mono">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[color:var(--accent-dark)] hover:underline inline-flex items-center gap-1"
          title="Ouvrir sur WhatsApp"
        >
          {enrollment.whatsapp}
          <span className="text-xs">↗</span>
        </a>
      </td>
      <td className="px-4 py-4 text-sm">
        {formation.schedule[enrollment.schedule].label}
      </td>
      <td className="px-4 py-4">
        <PaymentStatusBadge paid={paid} />
      </td>
      <td className="px-4 py-4 text-sm text-[color:var(--neutral-600)]">
        {paid ? formatFcfa(reg?.amount ?? formation.registrationFee) : "—"}
      </td>
      <td className="px-4 py-4 text-xs text-[color:var(--neutral-500)]">
        {new Date(enrollment.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-4 py-4 text-xs">
        <div className="flex items-center gap-1.5">
          {statusMsg ? (
            <span className="font-medium text-xs text-[color:var(--accent-dark)]">{statusMsg}</span>
          ) : (
            <button
              type="button"
              disabled={sending}
              onClick={() => handleRemind(paid ? "payment" : "registration")}
              className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-2.5 py-1.5 font-medium text-[color:var(--neutral-black)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-lightest)] disabled:opacity-50 cursor-pointer"
              title={paid ? "Relancer paiement tranches suivantes" : "Relancer paiement inscription"}
            >
              <span>💬</span>
              <span>{paid ? "Relance solde" : "Relancer"}</span>
            </button>
          )}

          {onGrantCoins && (
            <button
              type="button"
              onClick={() => onGrantCoins({ id: enrollment.id, name: enrollment.fullName })}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 font-medium text-amber-900 transition hover:bg-amber-100 active:scale-95 cursor-pointer shadow-2xs"
              title="Offrir des coins bonus pour les templates UI8"
            >
              <span>🪙</span>
              <span className="font-semibold">+Coins</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
