"use client";

import { useState } from "react";

interface UnlockFileTarget {
  id: string;
  name: string;
  size?: number;
  formattedSize: string;
  coinsCost: number;
  exampleId?: string;
  contentAttachmentId?: string;
}

interface UnlockConfirmModalProps {
  file: UnlockFileTarget | null;
  balance: number;
  onClose: () => void;
  onSuccess: (newBalance: number, fileId: string) => void;
  onOpenRecharge: () => void;
  onDownload?: () => Promise<void>;
}

export function UnlockConfirmModal({
  file,
  balance,
  onClose,
  onSuccess,
  onOpenRecharge,
  onDownload,
}: UnlockConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!file) return null;

  const hasEnoughCoins = balance >= file.coinsCost;
  const missingCoins = file.coinsCost - balance;
  const balanceAfter = balance - file.coinsCost;

  async function handleConfirmUnlock() {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const endpoint = file.exampleId ? `/api/ressources/exemples/${encodeURIComponent(file.exampleId)}/unlock`
        : file.contentAttachmentId ? `/api/ressources/supports/${encodeURIComponent(file.contentAttachmentId)}/unlock`
        : "/api/wallet/unlock";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedCost: file.coinsCost,
          fileId: file.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors du déblocage.");
      }

      onSuccess(data.newBalance, file.id);

      if (onDownload) {
        await onDownload();
      } else {
        const link = document.createElement("a");
        link.href = `/api/ressources/drive/download/${file.id}`;
        link.setAttribute("download", file.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      onClose();
    } catch (err) {
      setError((err as Error).message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="unlock-template-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-[color:var(--border)] bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-lg">
              🪙
            </span>
            <div>
              <h3 id="unlock-template-title" className="font-display text-lg font-bold text-[color:var(--neutral-black)]">
                Débloquer cette ressource
              </h3>
              <p className="text-xs text-[color:var(--neutral-500)]">Un seul achat, sans nouveau débit au téléchargement</p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            aria-label="Fermer le déblocage"
            onClick={onClose}
            className="rounded-lg p-1 text-[color:var(--neutral-400)] hover:bg-[color:var(--neutral-100)] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Détails du fichier */}
        <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-3.5">
          <p className="font-medium text-sm text-[color:var(--neutral-black)] break-words">
            {file.name}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-[color:var(--neutral-500)]">
            <span>Poids : <strong className="font-mono text-[color:var(--neutral-700)]">{file.formattedSize}</strong></span>
          </div>
        </div>

        {/* Récapitulatif Coins */}
        <div className="mt-4 space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-amber-900">Coût de la ressource :</span>
            <span className="font-mono text-sm font-bold text-amber-700">
              {file.coinsCost} Coins 🪙
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-900">Ton solde actuel :</span>
            <span className="font-mono font-medium text-amber-900">
              {balance} Coins 🪙
            </span>
          </div>
          {hasEnoughCoins && (
            <div className="flex items-center justify-between border-t border-amber-500/20 pt-2 font-semibold">
              <span className="text-amber-950">Solde restant après déblocage :</span>
              <span className="font-mono text-emerald-700">
                {balanceAfter} Coins 🪙
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6">
          {hasEnoughCoins ? (
            <div className="flex items-center justify-end gap-2">
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
                onClick={handleConfirmUnlock}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-600 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="size-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Déblocage en cours...
                  </>
                ) : (
                  <>
                    <span>Débloquer ({file.coinsCost} 🪙)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                ⚠️ Il te manque <strong>{missingCoins} coins</strong> pour débloquer cette ressource.
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-100)] cursor-pointer"
                >
                  Fermer
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRecharge();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-600 active:scale-95 cursor-pointer"
                >
                  <span>+</span>
                  <span>Recharger mes coins</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-[color:var(--neutral-400)]">
          💡 Une fois débloqué, ce fichier sera téléchargeable à tout moment sans jamais repayer.
        </p>
      </div>
    </div>
  );
}
