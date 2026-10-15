import { getCourseAccess } from "@/lib/access/course-access";
import { getIaProvider } from "@/lib/ia/providers";
import { readStudentIaKey } from "@/lib/ia/student-key";
import { getEnrollment } from "@/lib/store/enrollments";

/**
 * Passerelle IA FORGE IA (compatible OpenAI). Le fournisseur réel (NVIDIA NIM, DeepSeek…) vient de
 * `getIaProvider()` ; les apprenants utilisent toujours les mêmes alias de modèles.
 */
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

async function callProvider(url: string, payload: Record<string, unknown>, model: string, timeoutMs: number, apiKey: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Le délai ne couvre que l'attente des en-têtes : une réponse en streaming peut ensuite durer.
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ ...payload, model }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Transmet une requête chat/completions au fournisseur, avec bascule vers le modèle de secours si besoin. */
export async function forwardChatCompletion(payload: Record<string, unknown>): Promise<Response> {
  const provider = getIaProvider();
  if (!provider.apiKey) return iaError(503, "Passerelle IA non configurée (clé du fournisseur manquante).");
  const apiKey = provider.apiKey;

  const requested = typeof payload.model === "string" && payload.model ? payload.model : "forgeia-coder";
  const model = provider.resolveModel(requested);
  const fallbackModel = provider.resolveModel(provider.fallbackAlias);

  let upstream: Response | null = null;
  let reason = "";
  try {
    upstream = await callProvider(provider.chatUrl, payload, model, PRIMARY_TIMEOUT_MS, apiKey);
    if (upstream.status === 429 || upstream.status >= 500) {
      reason = `HTTP ${upstream.status}`;
      upstream = model === fallbackModel ? upstream : null;
    }
  } catch (error) {
    reason = error instanceof Error && error.name === "AbortError" ? "timeout" : String(error);
  }

  if (!upstream && model !== fallbackModel) {
    console.warn(`[ia:failover] ${model} (${reason}) -> ${fallbackModel}`);
    try {
      upstream = await callProvider(provider.chatUrl, payload, fallbackModel, FALLBACK_TIMEOUT_MS, apiKey);
    } catch (error) {
      reason = error instanceof Error && error.name === "AbortError" ? "timeout" : String(error);
    }
  }

  if (!upstream) {
    return iaError(504, `Délai d'attente ou saturation du modèle chez le fournisseur IA (${reason})`);
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
