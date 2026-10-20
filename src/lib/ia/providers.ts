/**
 * Fournisseur réel derrière la passerelle FORGE IA. Les apprenants utilisent toujours les mêmes alias
 * (forgeia-coder, deepseek-v4-pro…) ; on change de fournisseur avec la variable IA_PROVIDER.
 */
export type IaProvider = {
  id: "nvidia" | "deepseek";
  chatUrl: string;
  apiKey: string | null;
  resolveModel(alias: string): string;
  fallbackAlias: string;
};

type Env = Record<string, string | undefined>;

/** Seuls modèles acceptés par la passerelle (alias FORGE IA) : chacun a un tarif connu. */
export const PUBLIC_MODELS = [
  { id: "forgeia-coder", owned_by: "forge-ia" },
  { id: "deepseek-v4-flash", owned_by: "deepseek-ai" },
  { id: "deepseek-chat", owned_by: "deepseek-ai" },
  { id: "deepseek-coder", owned_by: "deepseek-ai" },
  { id: "deepseek-v4-pro", owned_by: "deepseek-ai" },
  { id: "kimi-k3", owned_by: "moonshotai" },
  { id: "nemotron-3.5", owned_by: "nvidia" },
];

export function isPublicModel(alias: string): boolean {
  return PUBLIC_MODELS.some((m) => m.id === alias);
}

const NVIDIA_MODELS: Record<string, string> = {
  "forgeia-coder": "deepseek-ai/deepseek-v4-flash-0731",
  "deepseek-chat": "deepseek-ai/deepseek-v4-flash-0731",
  "deepseek-coder": "deepseek-ai/deepseek-v4-flash-0731",
  "deepseek-v4-flash": "deepseek-ai/deepseek-v4-flash-0731",
  "deepseek-v4-pro": "deepseek-ai/deepseek-v4-pro-0813",
  "kimi-k3": "moonshotai/kimi-k3",
  "nemotron-3.5": "nvidia/nemotron-3.5-lightning-30b-a3b",
};

// Noms des modèles de l'API DeepSeek V4 (deepseek-chat / deepseek-reasoner ont été retirés le 2026-07-24).
const DEEPSEEK_MODELS: Record<string, string> = {
  "forgeia-coder": "deepseek-v4-flash",
  "deepseek-chat": "deepseek-v4-flash",
  "deepseek-coder": "deepseek-v4-flash",
  "deepseek-v4-flash": "deepseek-v4-flash",
  "deepseek-v4-pro": "deepseek-v4-pro",
};

const key = (value: string | undefined) => value?.trim() || null;

export function getIaProvider(env: Env = process.env): IaProvider {
  if (env.IA_PROVIDER?.trim() === "deepseek") {
    return {
      id: "deepseek",
      chatUrl: "https://api.deepseek.com/chat/completions",
      apiKey: key(env.DEEPSEEK_API_KEY),
      resolveModel: (alias) => DEEPSEEK_MODELS[alias] ?? alias,
      fallbackAlias: "deepseek-v4-pro",
    };
  }
  return {
    id: "nvidia",
    chatUrl: "https://integrate.api.nvidia.com/v1/chat/completions",
    apiKey: key(env.NVIDIA_API_KEY),
    resolveModel: (alias) => NVIDIA_MODELS[alias] ?? alias,
    fallbackAlias: "kimi-k3",
  };
}
