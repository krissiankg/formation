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
}: WalletWidgetProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  function handleGoToRecharge() {
    // Si on est dans le Hub, basculer vers l'onglet Boutique Coins
    window.dispatchEvent(new CustomEvent("open-coins-tab"));
    // Si la page ne répond pas à l'événement ou si on n'est pas sur /espace/ressources, naviguer vers /espace/coins
    if (typeof window !== "undefined" && window.location.pathname !== "/espace/ressources") {
      window.location.href = "/espace/coins";
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
              <span className="font-sans text-2xl font-black text-[color:var(--neutral-black)] tabular-nums">
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
              className="inline-flex items-center gap-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-3 py-2 text-xs font-medium text-[color:var(--neutral-700)] transition hover:bg-[color:var(--neutral-100)] cursor-pointer"
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
              onClick={handleGoToRecharge}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-600 active:scale-95 cursor-pointer"
              title="Accéder à la boutique de coins"
            >
              <span>+</span>
              <span>Recharger</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Historique des transactions */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-[color:var(--border)] bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95">
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
