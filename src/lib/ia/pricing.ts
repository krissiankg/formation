/** Tokens consommés par un appel à la passerelle IA. */
export type IaUsage = { promptTokens: number; cachedTokens: number; completionTokens: number };

export const USD_TO_FCFA = 600;

type Rate = { miss: number; hit: number; output: number }; // $ par million de tokens

// Tarifs de référence DeepSeek (heures pleines), appliqués aussi aux autres modèles tant
// qu'aucun fournisseur ne les facture autrement : ils servent à décompter le crédit IA.
const FLASH: Rate = { miss: 0.3, hit: 0.006, output: 1.2 };
const PRO: Rate = { miss: 1.32, hit: 0.044, output: 3.96 };

const RATES: Record<string, Rate> = {
  "forgeia-coder": FLASH,
  "deepseek-v4-flash": FLASH,
  "deepseek-chat": FLASH,
  "deepseek-coder": FLASH,
  "deepseek-v4-pro": PRO,
  "kimi-k3": FLASH,
  "nemotron-3.5": FLASH,
};

const toCount = (value: unknown) => (typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0);

/** Lit le bloc `usage` d'une réponse (formats OpenAI et DeepSeek). */
export function parseUsage(raw: unknown): IaUsage | null {
  if (!raw || typeof raw !== "object") return null;
  const usage = raw as Record<string, unknown>;
  const details = usage.prompt_tokens_details as Record<string, unknown> | undefined;
  return {
    promptTokens: toCount(usage.prompt_tokens),
    cachedTokens: toCount(details?.cached_tokens) || toCount(usage.prompt_cache_hit_tokens),
    completionTokens: toCount(usage.completion_tokens),
  };
}

/** Estimation quand le fournisseur n'a pas renvoyé d'usage (flux interrompu) : 4 caractères par token. */
export function estimateUsage(requestChars: number, responseChars: number): IaUsage {
  return {
    promptTokens: Math.ceil(requestChars / 4),
    cachedTokens: 0,
    completionTokens: Math.ceil(responseChars / 4),
  };
}

/** Coût d'un appel en FCFA, arrondi au centime. */
export function computeCostFcfa(alias: string, usage: IaUsage): number {
  const rate = RATES[alias] ?? FLASH;
  const cached = Math.min(usage.cachedTokens, usage.promptTokens);
  const usd =
    ((usage.promptTokens - cached) * rate.miss + cached * rate.hit + usage.completionTokens * rate.output) / 1_000_000;
  return Math.round(usd * USD_TO_FCFA * 100) / 100;
}
