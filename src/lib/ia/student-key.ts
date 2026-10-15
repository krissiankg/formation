import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Clé personnelle d'un apprenant pour la passerelle IA : `forge_<id d'inscription sans tirets><signature>`.
 * La signature (HMAC, préfixe « ia-key: ») empêche de fabriquer une clé ; l'identifiant permet de
 * retrouver l'apprenant et de couper l'accès s'il est bloqué.
 */
const PREFIX = "forge_";
const SIG_LENGTH = 22;

function sign(compactId: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return createHmac("sha256", secret).update(`ia-key:${compactId}`).digest("base64url").slice(0, SIG_LENGTH);
}

export function createStudentIaKey(enrollmentId: string): string {
  const compactId = enrollmentId.replace(/-/g, "").toLowerCase();
  return `${PREFIX}${compactId}${sign(compactId)}`;
}

/** Renvoie l'identifiant d'inscription (format UUID) si la clé est authentique, sinon null. */
export function readStudentIaKey(token: string): string | null {
  const match = new RegExp(`^${PREFIX}([0-9a-f]{32})([A-Za-z0-9_-]{${SIG_LENGTH}})$`).exec(token);
  if (!match || !process.env.ADMIN_SESSION_SECRET?.trim()) return null;
  const [, compactId, signature] = match;
  const given = Buffer.from(signature);
  const expected = Buffer.from(sign(compactId));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return compactId.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}
