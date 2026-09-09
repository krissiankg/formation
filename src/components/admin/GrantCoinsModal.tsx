"use client";

import { useState } from "react";

interface GrantCoinsModalProps {
  target: { id: string; name: string } | "all" | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GrantCoinsModal({ target, onClose, onSuccess }: GrantCoinsModalProps) {
  const [amount, setAmount] = useState<number>(20);
  const [reason, setReason] = useState<string>("Bonus accordé par l'administrateur");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!target) return null;

  const isAll = target === "all";
  const targetLabel = isAll ? "Toute la promotion (Tous les inscrits)" : target.name;

  async function handleGrant() {
    if (!target) return;
    if (amount <= 0) {
      setError("Le montant de coins doit être supérieur à zéro.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/wallet/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: isAll ? "all" : target.id,
          amount,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'octroi des coins.");
      }

      setSuccessMsg(
        isAll
          ? `Succès ! +${amount} coins offerts à ${data.count} apprenant(s).`
          : `Succès ! +${amount} coins crédités à ${targetLabel}.`
      );

      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setError((err as Error).message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-lg">
              🪙
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-[color:var(--neutral-black)]">
                Octroyer des Coins Bonus
              </h3>
              <p className="text-xs text-[color:var(--neutral-500)]">
                Crédit gratuit sur le portefeuille
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[color:var(--neutral-400)] hover:bg-[color:var(--neutral-100)] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
          <p className="text-amber-900">
            <strong>Bénéficiaire :</strong> {targetLabel}
          </p>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold">
            {successMsg}
          </div>
        )}

        <div className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[color:var(--neutral-700)] mb-1">
              Nombre de coins à offrir :
            </label>
            <div className="flex items-center gap-2">
              {[10, 20, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold cursor-pointer transition ${
                    amount === val
                      ? "bg-amber-500 text-white"
                      : "bg-[color:var(--neutral-100)] text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-200)]"
                  }`}
                >
                  +{val}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[color:var(--neutral-700)] mb-1">
              Motif du bonus (visible dans l&apos;historique de l&apos;élève) :
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Bonus de motivation, Récompense projet..."
              className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-100)] cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleGrant}
            disabled={loading || amount <= 0}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-600 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="size-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Envoi en cours...
              </>
            ) : (
              <>
                <span>🪙</span>
                <span>Créditer {amount} Coins</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
