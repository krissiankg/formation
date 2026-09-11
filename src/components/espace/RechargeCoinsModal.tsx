"use client";

import { useState } from "react";
import {
  COIN_PACKS,
  type CoinPack,
  calculateCoinsPriceFcfa,
  getCoinsUnitPriceFcfa,
  getCoinsDiscountPercent,
} from "@/lib/wallet/types";
import { formatFcfa } from "@/lib/format";

interface RechargeCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  packs?: CoinPack[];
  initialCoins?: number;
}

const PRESET_AMOUNTS = [10, 20, 30, 50, 100, 250];

export function RechargeCoinsModal({
  isOpen,
  onClose,
  currentBalance,
  packs = COIN_PACKS,
  initialCoins = 20,
}: RechargeCoinsModalProps) {
  const [customCoins, setCustomCoins] = useState<number>(initialCoins);
  const [inputValue, setInputValue] = useState<string>(String(initialCoins));
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPrice = calculateCoinsPriceFcfa(customCoins);
  const unitPrice = getCoinsUnitPriceFcfa(customCoins);
  const discount = getCoinsDiscountPercent(customCoins);

  function handleCoinsChange(newCoins: number) {
    const valid = Math.max(10, Math.round(newCoins / 10) * 10);
    setCustomCoins(valid);
    setInputValue(String(valid));
    setError(null);
  }

  function handleIncrement() {
    handleCoinsChange(customCoins + 10);
  }

  function handleDecrement() {
    if (customCoins > 10) {
      handleCoinsChange(customCoins - 10);
    }
  }

  function handleInputBlur() {
    const parsed = Number.parseInt(inputValue, 10);
    if (Number.isNaN(parsed) || parsed < 10) {
      handleCoinsChange(10);
    } else {
      handleCoinsChange(parsed);
    }
  }

  async function handleBuy(params: { packId?: string; customCoins?: number }) {
    try {
      const targetId = params.packId || `custom_${params.customCoins}`;
      setLoadingTarget(targetId);
      setError(null);

      const res = await fetch("/api/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || "Impossible d'initialiser le paiement.");
      }

      // Redirection sécurisée vers la page de paiement FedaPay
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError((err as Error).message || "Erreur lors de l'initialisation du paiement.");
      setLoadingTarget(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-[color:var(--border)] bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Header fixe */}
        <div className="flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-700 border border-amber-500/20">
              <span>🪙</span> Portefeuille Coins
            </div>
            <h3 className="font-display mt-2 text-xl sm:text-2xl font-bold text-[color:var(--neutral-black)]">
              Recharger des Coins
            </h3>
            <p className="mt-1 text-xs text-[color:var(--neutral-600)] leading-relaxed">
              Débloque instantanément les templates UI8 et ressources ZIP. Paiement sécurisé FedaPay (MTN, Moov, Orange, Wave, Carte).
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-2 text-[color:var(--neutral-400)] hover:bg-[color:var(--neutral-100)] hover:text-[color:var(--neutral-800)] transition cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Corps déroulant */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-0.5">
          {/* Solde actuel */}
          <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 sm:p-3.5">
            <span className="text-xs font-medium text-amber-900">Solde disponible :</span>
            <span className="font-mono text-sm sm:text-base font-bold text-amber-950 flex items-center gap-1.5">
              <span>{currentBalance}</span>
              <span className="text-xs font-semibold text-amber-700">Coins 🪙</span>
            </span>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
              <span className="text-base shrink-0">⚠️</span>
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* SECTION 1: MONTANT PERSONNALISÉ (PAR TRANCHE DE 10 COINS) */}
          <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/[0.06] to-transparent p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 font-display text-sm font-bold text-[color:var(--neutral-black)]">
                  🎯 Montant personnalisé
                </span>
                <p className="text-[11px] text-[color:var(--neutral-600)]">
                  Choisis la quantité exacte (par ajouts de 10 coins)
                </p>
              </div>

              {discount > 0 && (
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 shrink-0">
                  -{discount}% de réduction
                </span>
              )}
            </div>

            {/* Sélecteur pas-à-pas avec boutons +/- 10 */}
            <div className="mt-3.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={customCoins <= 10}
                className="flex size-11 items-center justify-center rounded-xl border border-[color:var(--border)] bg-white text-base font-bold text-[color:var(--neutral-800)] shadow-xs transition hover:bg-[color:var(--neutral-100)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Diminuer de 10 coins"
              >
                -10
              </button>

              <div className="flex-1 flex flex-col items-center justify-center rounded-xl bg-white border border-[color:var(--border)] py-1.5 px-3 shadow-2xs">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl">🪙</span>
                  <input
                    type="number"
                    step={10}
                    min={10}
                    max={2000}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleInputBlur}
                    className="w-20 text-center font-display text-2xl font-black text-[color:var(--neutral-black)] focus:outline-none"
                  />
                  <span className="font-display text-sm font-bold text-[color:var(--neutral-500)]">
                    Coins
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[color:var(--neutral-500)]">
                  {unitPrice} FCFA / coin
                </div>
              </div>

              <button
                type="button"
                onClick={handleIncrement}
                className="flex size-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-base font-bold text-amber-800 shadow-xs transition hover:bg-amber-500/20 active:scale-95 cursor-pointer shrink-0"
                title="Augmenter de 10 coins"
              >
                +10
              </button>
            </div>

            {/* Raccourcis de sélection rapide */}
            <div className="mt-3 flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase text-[color:var(--neutral-500)]">
                Sélection rapide :
              </span>
              <div className="flex gap-1 flex-wrap">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = customCoins === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleCoinsChange(amt)}
                      className={`rounded-lg px-2 py-1 font-mono text-[11px] font-bold transition cursor-pointer ${
                        isSelected
                          ? "bg-amber-500 text-white shadow-2xs"
                          : "bg-white text-[color:var(--neutral-700)] border border-[color:var(--border)] hover:bg-[color:var(--neutral-100)]"
                      }`}
                    >
                      {amt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bouton d'action pour le montant personnalisé */}
            <button
              type="button"
              disabled={loadingTarget !== null}
              onClick={() => handleBuy({ customCoins })}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 px-4 font-display text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loadingTarget === `custom_${customCoins}` ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Initialisation du paiement...
                </span>
              ) : (
                <>
                  <span>Recharger {customCoins} Coins</span>
                  <span className="font-mono font-normal opacity-90">·</span>
                  <span className="font-mono text-amber-100 underline decoration-white/40 underline-offset-2">
                    {formatFcfa(currentPrice)}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Séparateur élégant */}
          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[color:var(--border)]" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-mono text-[color:var(--neutral-400)] uppercase">
              ou packs standards en 1 clic
            </span>
          </div>

          {/* SECTION 2: GRILLE DES PACKS RAPIDES */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            {packs.map((pack) => {
              const isLoading = loadingTarget === pack.id;
              const isCurrentSelected = customCoins === pack.coins;

              return (
                <div
                  key={pack.id}
                  className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition ${
                    isCurrentSelected
                      ? "border-amber-500 bg-amber-500/[0.04] ring-2 ring-amber-500/20"
                      : pack.popular
                      ? "border-amber-400/70 bg-amber-50/50"
                      : "border-[color:var(--border)] bg-white hover:border-[color:var(--accent)]"
                  }`}
                >
                  {pack.badge && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-white shadow-2xs">
                      {pack.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🪙</span>
                        <span className="font-display text-base font-bold text-[color:var(--neutral-black)]">
                          {pack.coins} Coins
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[color:var(--accent-darkest)]">
                        {formatFcfa(pack.priceFcfa)}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-[color:var(--neutral-500)] line-clamp-1">
                      {pack.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={loadingTarget !== null}
                    onClick={() => handleBuy({ packId: pack.id })}
                    className={`mt-3 w-full rounded-lg py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                      pack.popular || isCurrentSelected
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

          {/* Note de réassurance sécurité */}
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-3 text-[11px] text-[color:var(--neutral-600)] leading-relaxed">
            🔒 <strong>Paiement sécurisé FedaPay :</strong> Tes coins sont crédités instantanément dès la validation. Les fichiers débloqués restent accessibles à vie sur ton compte.
          </div>
        </div>
      </div>
    </div>
  );
}
