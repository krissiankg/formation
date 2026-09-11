"use client";

import { useState, useEffect } from "react";
import { formatFcfa } from "@/lib/format";
import {
  COIN_PACKS,
  calculateCoinsPriceFcfa,
  getCoinsUnitPriceFcfa,
  getCoinsDiscountPercent,
  type CoinTransaction,
} from "@/lib/wallet/types";

interface CoinsShopSectionProps {
  initialBalance?: number;
  initialTransactions?: CoinTransaction[];
  onBalanceUpdated?: (newBalance: number) => void;
}

const PRESET_AMOUNTS = [10, 20, 30, 50, 100, 150, 200, 250, 500];

export function CoinsShopSection({
  initialBalance,
  initialTransactions,
  onBalanceUpdated,
}: CoinsShopSectionProps) {
  const [balance, setBalance] = useState<number | null>(
    typeof initialBalance === "number" ? initialBalance : null
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [transactions, setTransactions] = useState<CoinTransaction[]>(
    initialTransactions || []
  );

  // Montant personnalisé (défaut 50 coins)
  const [customCoins, setCustomCoins] = useState<number>(50);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger le solde actuel et l'historique
  async function loadWalletData() {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance ?? 0);
        setIsAdmin(Boolean(data.isAdmin));
        if (data.transactions) setTransactions(data.transactions);
        if (onBalanceUpdated && typeof data.balance === "number") {
          onBalanceUpdated(data.balance);
        }
      }
    } catch {
      // Échec silencieux
    }
  }

  useEffect(() => {
    loadWalletData();
  }, []);

  // Calculs tarifaires réactifs
  const validCoins = Math.max(10, Math.floor(customCoins / 10) * 10);
  const priceFcfa = calculateCoinsPriceFcfa(validCoins);
  const unitPrice = getCoinsUnitPriceFcfa(validCoins);
  const discountPercent = getCoinsDiscountPercent(validCoins);

  function adjustCoins(delta: number) {
    setError(null);
    setCustomCoins((prev) => {
      const next = Math.max(10, Math.min(2000, prev + delta));
      return Math.round(next / 10) * 10;
    });
  }

  function handleDirectInput(val: string) {
    setError(null);
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setCustomCoins(10);
    } else {
      setCustomCoins(Math.max(10, Math.min(2000, num)));
    }
  }

  function handleBlurInput() {
    // Forcer le multiple de 10 à la perte de focus
    setCustomCoins((prev) => {
      const rounded = Math.round(prev / 10) * 10;
      return Math.max(10, Math.min(2000, rounded));
    });
  }

  // Déclencher le paiement sécurisé FedaPay
  async function handlePurchase(options: { customCoins?: number; packId?: string }) {
    setError(null);
    const actionKey = options.packId || `custom_${options.customCoins}`;
    setLoadingAction(actionKey);

    try {
      const res = await fetch("/api/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || "Impossible de générer le lien de paiement.");
      }

      // Redirection immédiate vers la page de paiement FedaPay
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue lors de l'opération.");
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO BANNER : SOLDE ACTUEL & VALEUR DES COINS */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.03] to-transparent p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-900">
              <span className="size-2 rounded-full bg-amber-500 animate-ping" />
              <span>Boutique & Portefeuille Officiel</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[color:var(--neutral-black)]">
              Recharger vos Coins FORGE<span className="text-[color:var(--accent)]">IA</span>
            </h1>
            <p className="text-sm text-[color:var(--neutral-600)] leading-relaxed">
              Débloquez instantanément l&apos;intégralité des templates premium UI8, kits graphiques,
              composants Figma et codes sources. Les fichiers restent téléchargeables à vie sur votre compte.
            </p>
          </div>

          {/* Carte Solde en direct */}
          <div className="shrink-0 flex items-center gap-4 rounded-2xl border border-[color:var(--border)] bg-white/90 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-3xl shadow-inner shadow-amber-700/20">
              🪙
            </div>
            <div>
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-[color:var(--neutral-500)]">
                Solde disponible
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-3xl font-black tracking-tight text-[color:var(--neutral-black)] tabular-nums">
                  {isAdmin ? "Illimité" : balance !== null ? balance : "..."}
                </span>
                <span className="text-xs font-bold text-amber-700">
                  {balance !== null && balance > 1 ? "Coins" : "Coin"}
                </span>
              </div>
              {isAdmin && (
                <span className="inline-block rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-purple-700">
                  Accès Formateur
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Effet décoratif d'arrière-plan */}
        <div className="pointer-events-none absolute -right-12 -top-12 size-64 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      {/* Message d'erreur éventuel */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-semibold underline hover:no-underline cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* 2. SECTION PRINCIPALE : LE SIMULATEUR SUR-MESURE */}
      <div className="rounded-3xl border-2 border-amber-500/30 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[color:var(--border)] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--neutral-black)]">
                Montant sur-mesure (par ajouts de 10 coins)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[color:var(--neutral-500)] mt-1">
              Ajustez la quantité exacte selon vos besoins. Les tarifs sont dégressifs dès 50 coins.
            </p>
          </div>

          {discountPercent > 0 && (
            <div className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-700 shadow-2xs animate-pulse">
              <span>🎉</span>
              <span>Économisez {discountPercent}% sur cette recharge</span>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-6">
          {/* Contrôleur visuel central */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl bg-[color:var(--neutral-50)] p-6 border border-[color:var(--border)]">
            {/* Stepper tactile [-10] [Nombre] [+10] */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => adjustCoins(-10)}
                disabled={validCoins <= 10 || loadingAction !== null}
                className="flex size-12 sm:size-14 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white text-lg font-bold text-[color:var(--neutral-800)] shadow-xs transition hover:bg-[color:var(--neutral-100)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Retirer 10 coins"
                aria-label="Diminuer de 10 coins"
              >
                -10
              </button>

              <div className="relative flex min-w-[170px] sm:min-w-[210px] items-center justify-center rounded-2xl border-2 border-amber-500/40 bg-white px-4 py-2.5 shadow-inner">
                <span className="text-2xl sm:text-3xl mr-2">🪙</span>
                <input
                  type="number"
                  step={10}
                  min={10}
                  max={2000}
                  value={customCoins}
                  onChange={(e) => handleDirectInput(e.target.value)}
                  onBlur={handleBlurInput}
                  disabled={loadingAction !== null}
                  className="w-24 sm:w-28 text-center font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--neutral-black)] tabular-nums focus:outline-none bg-transparent"
                  aria-label="Nombre de coins"
                />
                <span className="text-xs sm:text-sm font-semibold text-[color:var(--neutral-500)] ml-1">
                  Coins
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustCoins(10)}
                disabled={loadingAction !== null}
                className="flex size-12 sm:size-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500 text-lg font-bold text-white shadow-xs transition hover:bg-amber-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Ajouter 10 coins"
                aria-label="Augmenter de 10 coins"
              >
                +10
              </button>
            </div>

            {/* Récapitulatif du coût en temps réel */}
            <div className="flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-[color:var(--border)] pt-4 md:pt-0 md:pl-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[color:var(--neutral-500)]">
                Montant total net
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-sans text-3xl sm:text-4xl font-black text-amber-600 tabular-nums">
                  {formatFcfa(priceFcfa)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--neutral-600)] font-mono">
                <span>Soit {unitPrice} FCFA / coin</span>
                {discountPercent > 0 && (
                  <span className="font-bold text-emerald-600">(-{discountPercent}%)</span>
                )}
              </div>
            </div>
          </div>

          {/* Curseur Glissière (Slider) réactif */}
          <div className="space-y-2 px-1">
            <div className="flex justify-between text-xs font-mono text-[color:var(--neutral-500)]">
              <span>Min : 10 coins</span>
              <span className="font-semibold text-amber-800">Glisser pour ajuster rapidement</span>
              <span>Max conseillé : 500 coins</span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={Math.min(500, validCoins)}
              onChange={(e) => setCustomCoins(Number(e.target.value))}
              className="w-full h-2.5 bg-[color:var(--neutral-200)] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Puces de montants rapides */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[color:var(--neutral-500)]">
              Sélection rapide en 1 clic :
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = validCoins === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setError(null);
                      setCustomCoins(amt);
                    }}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-mono font-bold transition cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-white shadow-xs ring-2 ring-amber-500/20"
                        : "border border-[color:var(--border)] bg-white text-[color:var(--neutral-700)] hover:border-amber-500/50 hover:bg-amber-50/50"
                    }`}
                  >
                    {amt} Coins
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bouton de Paiement Principal CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handlePurchase({ customCoins: validCoins })}
              disabled={loadingAction !== null}
              className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 px-6 py-4 font-sans text-base sm:text-lg font-bold text-white shadow-md shadow-amber-500/20 transition hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-wait cursor-pointer"
            >
              {loadingAction === `custom_${validCoins}` ? (
                <>
                  <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Génération de la transaction sécurisée...</span>
                </>
              ) : (
                <>
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>
                    Payer {formatFcfa(priceFcfa)} pour {validCoins} Coins
                  </span>
                  <span className="text-xs font-mono font-medium opacity-80 hidden sm:inline">
                    (FedaPay sécurisé)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. LES 4 PACKS STANDARDS EN GRILLE AÉRÉE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-[color:var(--neutral-black)]">
              Ou choisissez une formule standard prête à l&apos;emploi
            </h3>
            <p className="text-xs text-[color:var(--neutral-500)]">
              Des packages calibrés pour débloquer immédiatement vos contenus de formation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COIN_PACKS.map((pack) => {
            const isTarget = pack.id === "pack_100";
            const isBest = pack.id === "pack_250";
            const isPopular = pack.id === "pack_50";
            const unit = Math.round(pack.priceFcfa / pack.coins);

            return (
              <div
                key={pack.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition hover:shadow-md ${
                  isTarget
                    ? "border-amber-500 bg-amber-500/[0.04] ring-1 ring-amber-500 shadow-sm"
                    : isBest
                    ? "border-purple-300 bg-purple-500/[0.03]"
                    : "border-[color:var(--border)] bg-white"
                }`}
              >
                {/* Badge supérieur */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-2xl">🪙</span>
                  {pack.badge && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                        isTarget
                          ? "bg-amber-500 text-white"
                          : isBest
                          ? "bg-purple-600 text-white"
                          : isPopular
                          ? "bg-blue-600 text-white"
                          : "bg-[color:var(--neutral-200)] text-[color:var(--neutral-700)]"
                      }`}
                    >
                      {pack.badge}
                    </span>
                  )}
                </div>

                {/* Chiffres & Intitulé */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-sans text-2xl font-black text-[color:var(--neutral-black)] tabular-nums">
                      {pack.coins} Coins
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-amber-600">
                      {formatFcfa(pack.priceFcfa)}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[color:var(--neutral-500)]">
                    Soit {unit} FCFA / coin
                  </p>
                  <p className="text-xs text-[color:var(--neutral-600)] pt-2 line-clamp-2">
                    {pack.description}
                  </p>
                </div>

                {/* Bouton d'action */}
                <div className="mt-5 pt-3 border-t border-[color:var(--border)]/60">
                  <button
                    type="button"
                    onClick={() => handlePurchase({ packId: pack.id })}
                    disabled={loadingAction !== null}
                    className={`w-full rounded-xl py-2.5 px-3 text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer ${
                      isTarget
                        ? "bg-amber-500 text-white hover:bg-amber-600 shadow-xs"
                        : "border border-[color:var(--border)] bg-[color:var(--neutral-50)] text-[color:var(--neutral-800)] hover:bg-[color:var(--neutral-100)]"
                    }`}
                  >
                    {loadingAction === pack.id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Chargement...</span>
                      </span>
                    ) : (
                      <span>Acheter ce pack</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECTION RÉASSURANCE, MOYENS DE PAIEMENT & CONFIANCE */}
      <div className="rounded-3xl border border-[color:var(--border)] bg-gradient-to-b from-white to-[color:var(--neutral-50)] p-6 sm:p-8">
        <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[color:var(--neutral-700)] text-center mb-6">
          Paiement 100% sécurisé & Accès garanti
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-600">
              ⚡
            </div>
            <div>
              <h5 className="font-bold text-sm text-[color:var(--neutral-black)]">Crédit instantané</h5>
              <p className="text-xs text-[color:var(--neutral-600)] mt-0.5 leading-relaxed">
                Dès la validation de votre paiement Mobile Money ou Carte, vos coins sont immédiatement
                visibles et utilisables sur votre compte.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-600">
              🔓
            </div>
            <div>
              <h5 className="font-bold text-sm text-[color:var(--neutral-black)]">Accès à vie</h5>
              <p className="text-xs text-[color:var(--neutral-600)] mt-0.5 leading-relaxed">
                Tous les kits UI8, templates et archives ZIP débloqués restent téléchargeables
                sans aucune limite de temps.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-600">
              🛡️
            </div>
            <div>
              <h5 className="font-bold text-sm text-[color:var(--neutral-black)]">FedaPay certifié</h5>
              <p className="text-xs text-[color:var(--neutral-600)] mt-0.5 leading-relaxed">
                Transactions chiffrées de bout en bout. Compatible MTN, Moov Money, Orange Money, Wave et
                cartes bancaires (Visa / Mastercard).
              </p>
            </div>
          </div>
        </div>

        {/* Badges de paiement */}
        <div className="mt-6 pt-6 border-t border-[color:var(--border)] flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-[color:var(--neutral-500)]">
          <span className="font-semibold text-[color:var(--neutral-700)]">Moyens acceptés :</span>
          <span className="rounded-lg border border-[color:var(--border)] bg-white px-2.5 py-1">
            📱 MTN Mobile Money
          </span>
          <span className="rounded-lg border border-[color:var(--border)] bg-white px-2.5 py-1">
            📱 Moov Money
          </span>
          <span className="rounded-lg border border-[color:var(--border)] bg-white px-2.5 py-1">
            📱 Orange Money
          </span>
          <span className="rounded-lg border border-[color:var(--border)] bg-white px-2.5 py-1">
            🌊 Wave
          </span>
          <span className="rounded-lg border border-[color:var(--border)] bg-white px-2.5 py-1">
            💳 Visa & Mastercard
          </span>
        </div>
      </div>

      {/* 5. HISTORIQUE RÉCENT DES TRANSACTIONS (Optionnel si présent) */}
      {transactions.length > 0 && (
        <div className="rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-2xs">
          <h4 className="font-display text-base font-bold text-[color:var(--neutral-black)] mb-4">
            Historique récent de vos opérations
          </h4>
          <div className="divide-y divide-[color:var(--border)]/60">
            {transactions.slice(0, 5).map((t) => {
              const isCredit = t.amount > 0;
              const dateStr = new Date(t.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-base ${isCredit ? "text-emerald-500" : "text-amber-600"}`}>
                      {isCredit ? "➕" : "➖"}
                    </span>
                    <div>
                      <p className="font-semibold text-[color:var(--neutral-800)]">{t.description}</p>
                      <p className="text-[11px] font-mono text-[color:var(--neutral-400)]">{dateStr}</p>
                    </div>
                  </div>
                  <span
                    className={`font-sans font-bold text-sm tabular-nums ${
                      isCredit ? "text-emerald-600" : "text-[color:var(--neutral-700)]"
                    }`}
                  >
                    {isCredit ? "+" : "-"}{Math.abs(t.amount)} Coins
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
