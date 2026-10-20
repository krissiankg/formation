"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/espace/shared";
import { formatFcfa } from "@/lib/format";

export type IaStudentRow = {
  id: string;
  name: string;
  customBudget: number | null;
  budgetFcfa: number;
  /** Net des recharges. */
  spentFcfa: number;
  /** Consommation réelle (sans les recharges). */
  consumedFcfa: number;
  remainingFcfa: number;
  calls: number;
  lastAt: string | null;
};

const fr = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export function IaUsagePanel({ rows, defaultBudget, usdToFcfa }: { rows: IaStudentRow[]; defaultBudget: number; usdToFcfa: number }) {
  const totalConsumed = rows.reduce((n, r) => n + r.consumedFcfa, 0);
  const totalCalls = rows.reduce((n, r) => n + r.calls, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        kicker="Formation"
        title="Assistant IA"
        description={`Consommation de la passerelle IA par apprenant. Crédit inclus par défaut : ${formatFcfa(defaultBudget)}.`}
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Consommé" value={formatFcfa(totalConsumed)} />
        <Stat label="Coût fournisseur" value={`${fr(totalConsumed / usdToFcfa)} $`} />
        <Stat label="Appels IA" value={fr(totalCalls)} />
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-[color:var(--neutral-500)]">Aucun apprenant pour l&apos;instant.</p>
      ) : (
        <>
          <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
            {rows.map((r) => (
              <li key={r.id} className="min-w-0 space-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 font-medium">{r.name}</p>
                  <Remaining value={r.remainingFcfa} />
                </div>
                <p className="text-xs text-[color:var(--neutral-500)]">
                  {formatFcfa(r.consumedFcfa)} consommés · {fr(r.calls)} appels · dernier : {date(r.lastAt)}
                </p>
                <BudgetEditor row={r} defaultBudget={defaultBudget} />
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] xl:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[color:var(--neutral-100)] font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--neutral-500)]">
                <tr>
                  {["Apprenant", "Crédit IA", "Consommé", "Restant", "Appels", "Dernier appel"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-[color:var(--border)] align-top">
                    <td className="px-3 py-4 font-medium">{r.name}</td>
                    <td className="px-3 py-4"><BudgetEditor row={r} defaultBudget={defaultBudget} /></td>
                    <td className="px-3 py-4">{formatFcfa(r.consumedFcfa)}</td>
                    <td className="px-3 py-4"><Remaining value={r.remainingFcfa} /></td>
                    <td className="px-3 py-4">{fr(r.calls)}</td>
                    <td className="px-3 py-4 text-xs text-[color:var(--neutral-500)]">{date(r.lastAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-3 sm:p-5">
      <p className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--neutral-500)] sm:text-[10px]">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">{value}</p>
    </div>
  );
}

function Remaining({ value }: { value: number }) {
  const tone = value <= 0 ? "text-red-600" : value < 500 ? "text-[color:var(--accent-dark)]" : "text-[#2e5a36]";
  return <span className={`whitespace-nowrap font-semibold ${tone}`}>{formatFcfa(Math.max(0, value))}</span>;
}

function BudgetEditor({ row, defaultBudget }: { row: IaStudentRow; defaultBudget: number }) {
  const router = useRouter();
  const [value, setValue] = useState(row.customBudget === null ? "" : String(row.customBudget));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    const budgetFcfa = value.trim() === "" ? null : Number(value);
    if (budgetFcfa !== null && (!Number.isInteger(budgetFcfa) || budgetFcfa < 0)) {
      setState("error");
      return;
    }
    setState("saving");
    const res = await fetch("/api/admin/ia/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, budgetFcfa }),
    });
    setState(res.ok ? "saved" : "error");
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <input
        type="number"
        min={0}
        step={500}
        value={value}
        placeholder={`${defaultBudget} (défaut)`}
        onChange={(e) => {
          setValue(e.target.value);
          setState("idle");
        }}
        className="w-32 rounded-lg border border-[color:var(--border)] bg-white px-2 py-1.5"
        aria-label={`Crédit IA de ${row.name}`}
      />
      <button
        type="button"
        onClick={save}
        disabled={state === "saving"}
        className="cursor-pointer rounded-lg border border-[color:var(--accent)] px-2 py-1.5 font-medium text-[color:var(--accent-dark)] hover:bg-[color:var(--accent-lightest)] disabled:opacity-50"
      >
        {state === "saving" ? "…" : "Enregistrer"}
      </button>
      {state === "saved" ? <span className="text-[#2e5a36]">✓</span> : null}
      {state === "error" ? <span className="text-[color:var(--error)]">Montant invalide</span> : null}
    </div>
  );
}
