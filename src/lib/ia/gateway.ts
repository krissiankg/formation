import { getCourseAccess } from "@/lib/access/course-access";
import { CORS_HEADERS, iaError } from "@/lib/ia/http";
import { checkBudget, meterSseStream } from "@/lib/ia/meter";
import { estimateUsage, parseUsage, type IaUsage } from "@/lib/ia/pricing";
import { getIaProvider, isPublicModel, PUBLIC_MODELS } from "@/lib/ia/providers";
import { readStudentIaKey } from "@/lib/ia/student-key";
import { getIaBalance, recordIaUsage } from "@/lib/ia/usage-store";
import { getEnrollment } from "@/lib/store/enrollments";
import type { Enrollment } from "@/lib/types";

export { CORS_HEADERS, iaError, PUBLIC_MODELS };

/**
 * Passerelle IA FORGE IA (compatible OpenAI). Le fournisseur réel (NVIDIA NIM, DeepSeek…) vient de
 * `getIaProvider()` ; les apprenants utilisent toujours les mêmes alias de modèles. Chaque appel d'un
 * apprenant est décompté de son crédit IA.
 */

// Délai pour obtenir les en-têtes du modèle principal avant de basculer, puis délai du modèle de secours.
const PRIMARY_TIMEOUT_MS = 10_000;
const FALLBACK_TIMEOUT_MS = 35_000;

export type IaCaller = { kind: "master" } | { kind: "student"; enrollment: Enrollment };

// Évite une requête base de données par appel : un assistant de code en enchaîne beaucoup.
const AUTH_CACHE_MS = 5 * 60 * 1000;
const authCache = new Map<string, { caller: IaCaller | null; until: number }>();

/** Identifie l'appelant (`Authorization: Bearer …`) : clé master (optionnelle) ou clé apprenant signée et active. */
export async function authenticateIaRequest(request: Request): Promise<IaCaller | null> {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const master = process.env.IA_MASTER_KEY?.trim();
  if (master && token === master) return { kind: "master" };

  const cached = authCache.get(token);
  if (cached && cached.until > Date.now()) return cached.caller;

  const enrollmentId = readStudentIaKey(token);
  let caller: IaCaller | null = null;
  if (enrollmentId) {
    const enrollment = await getEnrollment(enrollmentId);
    const access = enrollment ? getCourseAccess(enrollment) : null;
    if (enrollment && access && !access.blocked && access.maxModuleSort >= 0) {
      caller = { kind: "student", enrollment };
    }
  }
  if (authCache.size > 5000) authCache.clear();
  authCache.set(token, { caller, until: Date.now() + AUTH_CACHE_MS });
  return caller;
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

type UsageCallback = (alias: string, usage: IaUsage | null, streamedChars: number) => void;

/** Transmet une requête chat/completions au fournisseur, avec bascule vers le modèle de secours si besoin. */
export async function forwardChatCompletion(payload: Record<string, unknown>, onUsage?: UsageCallback): Promise<Response> {
  const provider = getIaProvider();
  if (!provider.apiKey) return iaError(503, "Passerelle IA non configurée (clé du fournisseur manquante).");
  const apiKey = provider.apiKey;

  const requested = typeof payload.model === "string" && payload.model ? payload.model : "forgeia-coder";
  if (!isPublicModel(requested)) {
    return iaError(
      400,
      `Modèle inconnu : ${requested.slice(0, 60)}. Modèles disponibles : ${PUBLIC_MODELS.map((m) => m.id).join(", ")}.`,
      "invalid_request_error",
    );
  }
  const model = provider.resolveModel(requested);
  const fallbackModel = provider.resolveModel(provider.fallbackAlias);
  const body = payload.stream === true ? { ...payload, stream_options: { include_usage: true } } : payload;

  let upstream: Response | null = null;
  let alias = requested;
  let reason = "";
  try {
    upstream = await callProvider(provider.chatUrl, body, model, PRIMARY_TIMEOUT_MS, apiKey);
    if (upstream.status === 429 || upstream.status >= 500) {
      reason = `HTTP ${upstream.status}`;
      upstream = model === fallbackModel ? upstream : null;
    }
  } catch (error) {
    reason = error instanceof Error && error.name === "AbortError" ? "timeout" : String(error);
  }

  if (!upstream && model !== fallbackModel) {
    console.warn(`[ia:failover] ${model} (${reason}) -> ${fallbackModel}`);
    alias = provider.fallbackAlias;
    try {
      upstream = await callProvider(provider.chatUrl, body, fallbackModel, FALLBACK_TIMEOUT_MS, apiKey);
    } catch (error) {
      reason = error instanceof Error && error.name === "AbortError" ? "timeout" : String(error);
    }
  }

  if (!upstream) {
    return iaError(504, `Délai d'attente ou saturation du modèle chez le fournisseur IA (${reason})`);
  }

  const headers = {
    ...CORS_HEADERS,
    "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    "Cache-Control": "no-store",
  };

  // Les erreurs du fournisseur ne sont pas facturées.
  if (!upstream.ok || !upstream.body || !onUsage) {
    return new Response(upstream.body, { status: upstream.status, headers });
  }

  if (payload.stream === true) {
    const metered = meterSseStream(upstream.body, (usage, chars) => onUsage(alias, usage, chars));
    return new Response(metered, { status: upstream.status, headers });
  }

  const text = await upstream.text();
  let usage: IaUsage | null = null;
  let chars = 0;
  try {
    const json = JSON.parse(text) as { usage?: unknown; choices?: { message?: { content?: unknown } }[] };
    usage = parseUsage(json.usage);
    chars = (json.choices ?? []).reduce(
      (n, c) => n + (typeof c.message?.content === "string" ? c.message.content.length : 0),
      0,
    );
  } catch {
    chars = text.length;
  }
  onUsage(alias, usage, chars);
  return new Response(text, { status: upstream.status, headers });
}

/** Traite un appel chat/completions : identification, crédit IA, transmission et décompte. */
export async function handleChatCompletion(request: Request): Promise<Response> {
  const caller = await authenticateIaRequest(request);
  if (!caller) {
    return iaError(
      401,
      "Clé d'accès Forge IA invalide ou manquante. Connecte FORGEIA CODE depuis « Mon assistant IA » dans ton espace apprenant.",
      "authentication_error",
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return iaError(400, "Corps JSON invalide", "invalid_request_error");
  }

  if (caller.kind === "master") return forwardChatCompletion(payload);

  const { enrollment } = caller;
  const refused = checkBudget((await getIaBalance(enrollment)).remainingFcfa);
  if (refused) return refused;

  const requestChars = JSON.stringify(payload.messages ?? "").length;
  return forwardChatCompletion(payload, (alias, usage, streamedChars) => {
    recordIaUsage({
      enrollmentId: enrollment.id,
      alias,
      usage: usage ?? estimateUsage(requestChars, streamedChars),
      estimated: !usage,
    }).catch((error) => console.error("[ia:usage]", error));
  });
}
