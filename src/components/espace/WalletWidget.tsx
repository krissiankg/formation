"use client";

import { useState } from "react";
import type { CoinPack, CoinTransaction } from "@/lib/wallet/types";
import { formatFcfa } from "@/lib/format";

interface WalletWidgetProps {
  balance: number;
  isAdmin?: boolean;
  packs: CoinPack[];
  transactions?: CoinTransaction[];
  onRefresh?: () => void;
  openRechargeModal?: boolean;
  onCloseRechargeModal?: () => void;
}

export function WalletWidget({
  balance,
  isAdmin = false,
  packs,
  transactions = [],
  onRefresh,
  openRechargeModal = false,
  onCloseRechargeModal,
}: WalletWidgetProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const [rechargeError, setRechargeError] = useState<string | null>(null);

  const isModalVisible = modalOpen || openRechargeModal;

  function closeModal() {
    setModalOpen(false);
    if (onCloseRechargeModal) onCloseRechargeModal();
    setRechargeError(null);
  }

  async function handleBuyPack(pack: CoinPack) {
    try {
      setLoadingPackId(pack.id);
      setRechargeError(null);

      const res = await fetch("/api/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || "Impossible d'initialiser le paiement.");
      }

      // Redirection vers la page de paiement sécurisée FedaPay
      window.location.href = data.paymentUrl;
    } catch (err) {
      setRechargeError((err as Error).message || "Erreur de paiement.");
      setLoadingPackId(null);
    }
  }

  return (
    <>
      {/* Widget En-tête Wallet */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-white p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Pièce dorée animée */}
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-500 border border-amber-500/20">
            🪙
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[color:var(--neutral-500)]">Solde Portefeuille :</span>
              {isAdmin && (
                <span className="rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-purple-700">
                  ADMIN ILLIMITÉ
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-xl font-bold text-[color:var(--neutral-black)]">
                {isAdmin ? "∞" : balance}
              </span>
              <span className="text-xs font-semibold text-amber-600">
                {balance > 1 ? "Coins" : "Coin"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton historique */}
          {transactions.length > 0 && (
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-3 py-2 text-xs font-medium text-[color:var(--neutral-700)] transition hover:bg-[color:var(--neutral-100)]"
              title="Historique des transactions"
            >
              <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Historique</span>
            </button>
          )}

          {/* Bouton Recharger */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-600 active:scale-95 cursor-pointer"
            >
              <span>+</span>
              <span>Recharger</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Rechargement de Coins */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-600">
                  <span>🪙</span> Portefeuille Étudiant
                </div>
                <h3 className="font-display mt-2 text-xl font-bold text-[color:var(--neutral-black)]">
                  Recharger des Coins
                </h3>
                <p className="mt-1 text-xs text-[color:var(--neutral-600)]">
                  Utilise tes coins pour débloquer les templates et kits UI8 de la formation. Paiement sécurisé par Mobile Money (MTN, Moov, Orange, Wave) ou Carte via FedaPay.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-[color:var(--neutral-400)] hover:bg-[color:var(--neutral-100)] hover:text-[color:var(--neutral-700)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Solde actuel dans la modale */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-500/5 border border-amber-500/15 p-3">
              <span className="text-xs text-amber-800">Solde disponible :</span>
              <span className="font-mono text-sm font-bold text-amber-900">
                {balance} Coins 🪙
              </span>
            </div>

            {rechargeError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {rechargeError}
              </div>
            )}

            {/* Grille des packs */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {packs.map((pack) => {
                const isLoading = loadingPackId === pack.id;
                return (
                  <div
                    key={pack.id}
                    className={`relative flex flex-col justify-between rounded-xl border p-4 transition ${
                      pack.popular
                        ? "border-amber-500 bg-amber-500/5 shadow-xs"
                        : "border-[color:var(--border)] bg-white hover:border-[color:var(--accent)]"
                    }`}
                  >
                    {pack.badge && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-white shadow-xs">
                        {pack.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">🪙</span>
                        <span className="font-display text-lg font-bold text-[color:var(--neutral-black)]">
                          {pack.coins} Coins
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-sm font-semibold text-[color:var(--accent-darkest)]">
                        {formatFcfa(pack.priceFcfa)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleBuyPack(pack)}
                      className={`mt-4 w-full rounded-lg py-2 text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                        pack.popular
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "bg-[color:var(--neutral-100)] text-[color:var(--neutral-800)] hover:bg-[color:var(--neutral-200)]"
                      }`}
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center gap-1">
                          <svg className="size-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Chargement...
                        </span>
                      ) : (
                        `Choisir ce pack`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Note d'information */}
            <div className="mt-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-3 text-[11px] text-[color:var(--neutral-600)]">
              🔒 <strong>Paiement sécurisé :</strong> Tes coins sont crédités instantanément sur ton compte dès la validation du paiement FedaPay. Les fichiers débloqués restent accessibles à vie.
            </div>
          </div>
        </div>
      )}

      {/* Modal Historique des transactions */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-lg font-bold text-[color:var(--neutral-black)]">
                Historique des Coins
              </h3>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="rounded-lg p-1 text-[color:var(--neutral-400)] hover:bg-[color:var(--neutral-100)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto divide-y divide-[color:var(--border)]/60">
              {transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                const formattedDate = new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-medium text-[color:var(--neutral-black)]">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-[color:var(--neutral-400)]">{formattedDate}</p>
                    </div>

                    <span
                      className={`font-mono font-bold shrink-0 ${
                        isPositive ? "text-emerald-600" : "text-amber-700"
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} 🪙
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[color:var(--border)] text-right">
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="rounded-lg bg-[color:var(--neutral-100)] px-3 py-1.5 text-xs font-medium text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-200)] cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
