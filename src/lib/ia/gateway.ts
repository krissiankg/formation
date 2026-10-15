import { getCourseAccess } from "@/lib/access/course-access";
import { readStudentIaKey } from "@/lib/ia/student-key";
import { getEnrollment } from "@/lib/store/enrollments";

/**
 * Passerelle IA FORGE IA (compatible OpenAI) vers NVIDIA NIM.
 * Remplace l'ancien service `ia.guelichweb.store` du VPS : mêmes modèles, même bascule automatique.
 */
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export const PRIMARY_MODEL = "deepseek-ai/deepseek-v4-flash-0731";
export const FALLBACK_MODEL = "moonshotai/kimi-k3";

const MODEL_MAPPING: Record<string, string> = {
  "forgeia-coder": PRIMARY_MODEL,
  "deepseek-chat": PRIMARY_MODEL,
  "deepseek-coder": PRIMARY_MODEL,
  "deepseek-v4-flash": PRIMARY_MODEL,
  "deepseek-v4-pro": "deepseek-ai/deepseek-v4-pro-0813",
  "kimi-k3": FALLBACK_MODEL,
  "nemotron-3.5": "nvidia/nemotron-3.5-lightning-30b-a3b",
};

export const PUBLIC_MODELS = [
  { id: "forgeia-coder", owned_by: "forge-ia" },
  { id: "deepseek-v4-flash", owned_by: "deepseek-ai" },
  { id: "deepseek-chat", owned_by: "deepseek-ai" },
  { id: "deepseek-v4-pro", owned_by: "deepseek-ai" },
  { id: "kimi-k3", owned_by: "moonshotai" },
  { id: "nemotron-3.5", owned_by: "nvidia" },
];

// Délai pour obtenir les en-têtes du modèle principal avant de basculer, puis délai du modèle de secours.
const PRIMARY_TIMEOUT_MS = 10_000;
const FALLBACK_TIMEOUT_MS = 35_000;

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function iaError(status: number, message: string, type = "gateway_error") {
  return Response.json({ error: { message, type, code: status } }, { status, headers: CORS_HEADERS });
}

// Évite une requête base de données par appel : un assistant de code en enchaîne beaucoup.
const AUTH_CACHE_MS = 5 * 60 * 1000;
const authCache = new Map<string, { ok: boolean; until: number }>();

/** Vérifie la clé `Authorization: Bearer …` : clé master (optionnelle) ou clé apprenant signée et active. */
export async function authorizeIaRequest(request: Request): Promise<boolean> {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  const master = process.env.IA_MASTER_KEY?.trim();
  if (master && token === master) return true;

  const cached = authCache.get(token);
  if (cached && cached.until > Date.now()) return cached.ok;

  const enrollmentId = readStudentIaKey(token);
  let ok = false;
  if (enrollmentId) {
    const enrollment = await getEnrollment(enrollmentId);
    const access = enrollment ? getCourseAccess(enrollment) : null;
    ok = Boolean(access && !access.blocked && access.maxModuleSort >= 0);
  }
  if (authCache.size > 5000) authCache.clear();
  authCache.set(token, { ok, until: Date.now() + AUTH_CACHE_MS });
  return ok;
}

async function callNvidia(payload: Record<string, unknown>, model: string, timeoutMs: number, apiKey: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Le délai ne couvre que l'attente des en-têtes : une réponse en streaming peut ensuite durer.
    return await fetch(NVIDIA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ ...payload, model }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Transmet une requête chat/completions à NVIDIA, avec bascule vers le modèle de secours si besoin. */
export async function forwardChatCompletion(payload: Record<string, unknown>): Promise<Response> {
  const apiKey = process.env.NVIDIA_API_KEY?.trim();
  if (!apiKey) return iaError(503, "Passerelle IA non configurée (clé NVIDIA manquante).");

  const requested = typeof payload.model === "string" && payload.model ? payload.model : "forgeia-coder";
  const model = MODEL_MAPPING[requested] ?? requested;

  let upstream: Response | null = null;
  let reason = "";
  try {
    upstream = await callNvidia(payload, model, PRIMARY_TIMEOUT_MS, apiKey);
    if (upstream.status === 429 || upstream.status >= 500) {
      reason = `HTTP ${upstream.status}`;
      upstream = model === FALLBACK_MODEL ? upstream : null;
    }
  } catch (error) {
    reason = error instanceof Error && error.name === "AbortError" ? "timeout" : String(error);
  }

  if (!upstream && model !== FALLBACK_MODEL) {
    console.warn(`[ia:failover] ${model} (${reason}) -> ${FALLBACK_MODEL}`);
    try {
      upstream = await callNvidia(payload, FALLBACK_MODEL, FALLBACK_TIMEOUT_MS, apiKey);
    } catch (error) {
      reason = error instanceof Error && error.name === "AbortError" ? "timeout" : String(error);
    }
  }

  if (!upstream) {
    return iaError(504, `Délai d'attente ou saturation du modèle sur NVIDIA NIM (${reason})`);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}
