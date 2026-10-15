"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatFcfa } from "@/lib/format";
import type { IaBalance, IaUsageRow } from "@/lib/ia/usage-store";

type Props = {
  version: string;
  downloadPath: string;
  connectUrl: string;
  apiKey: string;
  balance: IaBalance;
  walletCoins: number;
  fcfaPerCoin: number;
  recent: IaUsageRow[];
};

const fr = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

export function AssistantIaClient({ version, downloadPath, connectUrl, apiKey, balance, walletCoins, fcfaPerCoin, recent }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [coins, setCoins] = useState(Math.min(50, Math.floor(walletCoins / 10) * 10) || 10);
  const [topping, setTopping] = useState(false);
  const [topupMsg, setTopupMsg] = useState<string | null>(null);

  const remaining = Math.max(0, balance.remainingFcfa);
  const percentLeft = balance.budgetFcfa > 0 ? Math.min(100, Math.round((remaining / balance.budgetFcfa) * 100)) : 0;
  const low = remaining < 500;

  async function copyKey() {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function topUp() {
    if (!window.confirm(`Convertir ${coins} coins en ${formatFcfa(coins * fcfaPerCoin)} de crédit IA ?`)) return;
    setTopping(true);
    setTopupMsg(null);
    try {
      const res = await fetch("/api/ia/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setTopupMsg(`✅ +${formatFcfa(coins * fcfaPerCoin)} ajoutés à ton crédit IA.`);
      router.refresh();
    } catch (err: any) {
      setTopupMsg(`❌ ${err.message || "Erreur"}`);
    } finally {
      setTopping(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Crédit IA */}
      <section className={`rounded-2xl border p-5 sm:p-6 ${low ? "border-[color:var(--accent)] bg-[color:var(--accent-lightest)]" : "border-[color:var(--border)] bg-[color:var(--neutral-50)]"}`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--neutral-500)]">Crédit IA restant</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{formatFcfa(remaining)}</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[color:var(--neutral-200)]">
          <div className={`h-full rounded-full ${low ? "bg-[color:var(--accent)]" : "bg-[#2e7d32]"}`} style={{ width: `${percentLeft}%` }} />
        </div>
        <p className="mt-2 text-xs text-[color:var(--neutral-500)]">
          {formatFcfa(balance.spentFcfa > 0 ? balance.spentFcfa : 0)} utilisés sur {formatFcfa(balance.budgetFcfa)} inclus dans ta formation.
        </p>
      </section>

      {/* Installer + connecter */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
          <h2 className="font-display text-xl">1. Installer FORGEIA CODE</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-[color:var(--neutral-600)]">
            <li>Installe VS Code (gratuit) depuis code.visualstudio.com.</li>
            <li>Télécharge FORGEIA CODE ci-dessous.</li>
            <li>Dans VS Code : Extensions → « … » → « Installer depuis un VSIX… » et choisis le fichier. Kilo Code s&apos;installe avec.</li>
          </ol>
          <a href={downloadPath} className="btn-ghost mt-4 inline-flex !py-2.5 text-sm" download>
            ⬇️ Télécharger FORGEIA CODE v{version}
          </a>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
          <h2 className="font-display text-xl">2. Connecter ton compte</h2>
          <p className="mt-3 text-sm text-[color:var(--neutral-600)]">
            VS Code ouvert, clique ici : FORGEIA CODE se connecte et règle Kilo Code tout seul.
          </p>
          <a href={connectUrl} className="btn-primary mt-4 inline-flex !py-2.5 text-sm">
            🔗 Connecter FORGEIA CODE
          </a>
          <p className="mt-4 text-xs text-[color:var(--neutral-500)]">
            Le bouton ne marche pas ? Dans VS Code, lance « FORGE IA : saisir ma clé » et colle ta clé :
          </p>
          <button
            type="button"
            onClick={copyKey}
            className="mt-2 w-full truncate rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-left font-mono text-[11px] text-[color:var(--neutral-600)] hover:border-[color:var(--accent)]"
            title="Copier ma clé personnelle"
          >
            {copied ? "✓ Clé copiée" : `${apiKey.slice(0, 14)}… — copier ma clé`}
          </button>
        </div>
      </section>

      {/* Recharge */}
      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
        <h2 className="font-display text-xl">Recharger avec mes coins</h2>
        <p className="mt-2 text-sm text-[color:var(--neutral-600)]">
          1 coin = {formatFcfa(fcfaPerCoin)} de crédit IA. Tu as {fr(walletCoins)} coins.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={10}
            step={10}
            value={coins}
            onChange={(e) => setCoins(Number(e.target.value))}
            className="input-field !w-32"
            aria-label="Nombre de coins"
          />
          <button
            type="button"
            onClick={topUp}
            disabled={topping || coins < 10 || coins % 10 !== 0 || coins > walletCoins}
            className="btn-primary !py-2.5 text-sm disabled:opacity-50"
          >
            {topping ? "Recharge…" : `Convertir en ${formatFcfa(coins * fcfaPerCoin)}`}
          </button>
        </div>
        {topupMsg ? <p className="mt-3 text-sm">{topupMsg}</p> : null}
      </section>

      {/* Historique */}
      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
        <h2 className="font-display text-xl">Mes derniers échanges avec l&apos;IA</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--neutral-500)]">Aucun échange pour l&apos;instant.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[color:var(--border)] text-sm">
            {recent.map((r, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
                <span className="text-[color:var(--neutral-600)]">
                  {new Date(r.createdAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  {" · "}
                  {r.alias === "topup" ? "Recharge" : r.alias}
                </span>
                <span className="text-xs text-[color:var(--neutral-500)]">
                  {r.alias === "topup"
                    ? `+${formatFcfa(-r.costFcfa)}`
                    : `${fr(r.promptTokens + r.completionTokens)} tokens${r.estimated ? " (estimé)" : ""} · ${fr(r.costFcfa)} F`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
