import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Jeton court (10 min) qui relie FORGEIA CODE au compte d'un apprenant : la plateforme le place dans un
 * lien `vscode://…/connect?token=…`, l'extension l'échange contre la clé personnelle de l'apprenant.
 * Format : `link:<id d'inscription>:<expiration>.<signature>` (préfixe distinct des jetons de session).
 */
const TTL_SECONDS = 10 * 60;

function sign(payload: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createIaLinkToken(enrollmentId: string, now = Date.now()): string {
  const payload = `link:${enrollmentId}:${Math.floor(now / 1000) + TTL_SECONDS}`;
  return `${payload}.${sign(payload)}`;
}

/** Renvoie l'identifiant d'inscription si le jeton est authentique et non expiré, sinon null. */
export function readIaLinkToken(token: string, now = Date.now()): string | null {
  if (!process.env.ADMIN_SESSION_SECRET?.trim()) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const [prefix, enrollmentId, exp, ...rest] = payload.split(":");
  if (prefix !== "link" || !enrollmentId || !exp || rest.length) return null;
  if (!(Number(exp) > Math.floor(now / 1000))) return null;
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return enrollmentId;
}
