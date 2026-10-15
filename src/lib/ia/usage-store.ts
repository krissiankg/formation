import { formation } from "@/lib/config/formation";
import { computeCostFcfa, type IaUsage } from "@/lib/ia/pricing";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Enrollment } from "@/lib/types";
import { debitCoinsForIa } from "@/lib/wallet/store";

/** Valeur d'un coin en crédit IA (même prix que les packs de coins : 10 coins = 500 F). */
export const FCFA_PER_COIN = 50;

export type IaBalance = { budgetFcfa: number; spentFcfa: number; remainingFcfa: number };

export type IaUsageRow = {
  alias: string;
  promptTokens: number;
  cachedTokens: number;
  completionTokens: number;
  estimated: boolean;
  costFcfa: number;
  createdAt: string;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function recordIaUsage(input: {
  enrollmentId: string;
  alias: string;
  usage: IaUsage;
  estimated: boolean;
}): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("ia_usage")
    .insert({
      enrollment_id: input.enrollmentId,
      alias: input.alias,
      prompt_tokens: input.usage.promptTokens,
      cached_tokens: input.usage.cachedTokens,
      completion_tokens: input.usage.completionTokens,
      estimated: input.estimated,
      cost_fcfa: computeCostFcfa(input.alias, input.usage),
    });
  if (error) throw error;
}

async function getSpentFcfa(enrollmentId: string): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from("ia_usage_totals")
    .select("spent_fcfa")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();
  if (error) throw error;
  return Number(data?.spent_fcfa ?? 0);
}

/** Budget, dépense (recharges déduites) et reste du crédit IA d'un apprenant. */
export async function getIaBalance(enrollment: Enrollment): Promise<IaBalance> {
  const budgetFcfa = enrollment.iaBudgetFcfa ?? formation.iaBudgetFcfa;
  const spentFcfa = round2(await getSpentFcfa(enrollment.id));
  return { budgetFcfa, spentFcfa, remainingFcfa: round2(budgetFcfa - spentFcfa) };
}

export async function listRecentIaUsage(enrollmentId: string, limit = 20): Promise<IaUsageRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("ia_usage")
    .select("alias, prompt_tokens, cached_tokens, completion_tokens, estimated, cost_fcfa, created_at")
    .eq("enrollment_id", enrollmentId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    alias: r.alias,
    promptTokens: r.prompt_tokens,
    cachedTokens: r.cached_tokens,
    completionTokens: r.completion_tokens,
    estimated: r.estimated,
    costFcfa: Number(r.cost_fcfa),
    createdAt: r.created_at,
  }));
}

export async function listIaUsageByStudent(): Promise<
  { enrollmentId: string; spentFcfa: number; calls: number; lastAt: string | null }[]
> {
  const { data, error } = await getSupabaseAdmin()
    .from("ia_usage_totals")
    .select("enrollment_id, spent_fcfa, calls, last_at");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    enrollmentId: r.enrollment_id,
    spentFcfa: Number(r.spent_fcfa),
    calls: Number(r.calls),
    lastAt: r.last_at ?? null,
  }));
}

export async function setIaBudget(enrollmentId: string, fcfa: number | null): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("enrollments")
    .update({ ia_budget_fcfa: fcfa })
    .eq("id", enrollmentId);
  if (error) throw error;
}

/** Convertit des coins en crédit IA : débite le portefeuille puis enregistre une recharge (coût négatif). */
export async function topUpIaFromCoins(enrollmentId: string, coins: number): Promise<void> {
  await debitCoinsForIa(enrollmentId, coins);
  const { error } = await getSupabaseAdmin()
    .from("ia_usage")
    .insert({ enrollment_id: enrollmentId, alias: "topup", cost_fcfa: -coins * FCFA_PER_COIN });
  if (error) throw error;
}
