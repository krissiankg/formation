"use client";

import { useState } from "react";
import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import type { AccessOverride, Enrollment } from "@/lib/types";
import { getCourseAccess } from "@/lib/access/course-access";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";

export function EnrollmentRow({
  enrollment,
  compact = false,
  variant = "row",
  coins,
  onGrantCoins,
}: {
  enrollment: Enrollment;
  compact?: boolean;
  /** "card" : présentation empilée pour les petits écrans. */
  variant?: "row" | "card";
  /** Solde du portefeuille ; absent si l'apprenant ne l'a pas encore ouvert. */
  coins?: number;
  onGrantCoins?: (student: { id: string; name: string }) => void;
}) {
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [override, setOverride] = useState<"auto" | AccessOverride>(enrollment.accessOverride ?? "auto");
  const [savingAccess, setSavingAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const reg = enrollment.payments.find((p) => p.kind === "registration");
  const paid = reg?.status === "paid";
  const isPaidKind = (kind: string) => enrollment.payments.some((p) => p.kind === kind && p.status === "paid");
  const paidTotal = enrollment.payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const paidPercent = Math.min(100, Math.round((paidTotal / formation.totalPrice) * 100));
  const stage = isPaidKind("month1")
    ? { label: "Soldé ✓", done: true }
    : isPaidKind("start")
      ? { label: "1re tranche payée", done: false }
      : paid
        ? { label: "Inscription payée", done: false }
        : { label: "Inscription en attente", done: false };
  const access = getCourseAccess({
    payments: enrollment.payments,
    accessOverride: override === "auto" ? undefined : override,
  });

  async function handleAccessChange(next: "auto" | AccessOverride) {
    const previous = override;
    setOverride(next);
    setSavingAccess(true);
    setAccessError(null);
    try {
      const res = await fetch("/api/admin/enrollments/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: enrollment.id, override: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
    } catch (err: any) {
      setOverride(previous);
      setAccessError(err.message || "Erreur");
      setTimeout(() => setAccessError(null), 3500);
    } finally {
      setSavingAccess(false);
    }
  }

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

  const inscritLe = new Date(enrollment.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const identity = (
    <>
      <div className="font-medium text-[color:var(--neutral-black)]">{enrollment.fullName}</div>
      <div className="break-all text-xs text-[color:var(--neutral-500)]">{enrollment.email}</div>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-[color:var(--accent-dark)] hover:underline"
        title="Ouvrir sur WhatsApp"
      >
        {enrollment.whatsapp} <span aria-hidden>↗</span>
      </a>
    </>
  );

  const schedule = (
    <>
      <div>{formation.schedule[enrollment.schedule].label}</div>
      <div className="mt-1 text-xs text-[color:var(--neutral-500)]">Inscrit le {inscritLe}</div>
    </>
  );

  const payments = (
    <>
      <div className="text-sm font-medium text-[color:var(--neutral-black)]">
        {paidTotal.toLocaleString("fr-FR")}
        <span className="font-normal text-[color:var(--neutral-500)]"> / {formatFcfa(formation.totalPrice)}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full max-w-36 overflow-hidden rounded-full bg-[color:var(--neutral-200)]">
        <div
          className={`h-full rounded-full ${stage.done ? "bg-[#2e7d32]" : "bg-[color:var(--accent)]"}`}
          style={{ width: `${paidPercent}%` }}
        />
      </div>
      <div className={`mt-1 text-[11px] ${stage.done ? "text-[#2e5a36]" : "text-[color:var(--neutral-500)]"}`}>
        {stage.label}
      </div>
    </>
  );

  const coinsBadge =
    coins === undefined ? (
      <span className="text-[color:var(--neutral-400)]" title="Portefeuille pas encore ouvert">
        —
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-amber-700">
        <span aria-hidden>🪙</span>
        {coins.toLocaleString("fr-FR")}
      </span>
    );

  const accessControl = (
    <>
      <select
        value={override}
        disabled={savingAccess}
        onChange={(e) => handleAccessChange(e.target.value as "auto" | AccessOverride)}
        className="w-full max-w-44 rounded-lg border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-2 py-1.5 text-xs font-medium text-[color:var(--neutral-black)] disabled:opacity-50"
        title="Accès au cours de cet apprenant"
      >
        <option value="auto">Automatique</option>
        <option value="full">Accès complet forcé</option>
        <option value="blocked">Accès bloqué</option>
      </select>
      <div
        className={`mt-1 text-[11px] ${
          access.blocked
            ? "text-red-600"
            : access.overridden
              ? "text-[color:var(--accent-dark)]"
              : "text-[color:var(--neutral-500)]"
        }`}
      >
        {accessError ? `❌ ${accessError}` : access.label}
      </div>
    </>
  );

  const actions = (
    <>
      {statusMsg ? (
        <span className="font-medium text-[color:var(--accent-dark)]">{statusMsg}</span>
      ) : (
        <button
          type="button"
          disabled={sending}
          onClick={() => handleRemind(paid ? "payment" : "registration")}
          className="inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-2.5 py-1.5 font-medium text-[color:var(--neutral-black)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-lightest)] disabled:opacity-50"
          title={paid ? "Relancer paiement tranches suivantes" : "Relancer paiement inscription"}
        >
          <span aria-hidden>💬</span>
          <span>{paid ? "Relance solde" : "Relancer"}</span>
        </button>
      )}

      {onGrantCoins && (
        <button
          type="button"
          onClick={() => onGrantCoins({ id: enrollment.id, name: enrollment.fullName })}
          className="inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 font-medium text-amber-900 shadow-2xs transition hover:bg-amber-100 active:scale-95"
          title="Offrir des coins bonus pour les templates UI8"
        >
          <span aria-hidden>🪙</span>
          <span className="font-semibold">+Coins</span>
        </button>
      )}
    </>
  );

  if (variant === "card") {
    return (
      <li className="min-w-0 space-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">{identity}</div>
          <div className="shrink-0 text-sm">{coinsBadge}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="min-w-0">{schedule}</div>
          <div className="min-w-0">{payments}</div>
        </div>
        <div className="text-xs">{accessControl}</div>
        <div className="flex flex-wrap gap-2 text-xs">{actions}</div>
      </li>
    );
  }

  return (
    <tr className="border-t border-[color:var(--border)] align-top transition hover:bg-[color:var(--neutral-100)]/80">
      <td className="px-3 py-4">{identity}</td>
      <td className="px-3 py-4 text-sm">{schedule}</td>
      <td className="px-3 py-4">{payments}</td>
      <td className="px-3 py-4 text-sm">{coinsBadge}</td>
      <td className="px-3 py-4 text-xs">{accessControl}</td>
      <td className="px-3 py-4 text-xs">
        <div className="flex flex-col items-stretch gap-1.5">{actions}</div>
      </td>
    </tr>
  );
}
