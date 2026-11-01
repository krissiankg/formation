import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signature HMAC des jetons apprenant (session, réinitialisation du mot de passe).
 * Chaque jeton porte son propre préfixe (« student: », « reset: ») pour qu'aucun ne serve à la place d'un autre.
 */
function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return value;
}

export function hmacSign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function hmacMatches(payload: string, signature: string): boolean {
  if (!process.env.ADMIN_SESSION_SECRET?.trim()) return false;
  const given = Buffer.from(signature);
  const expected = Buffer.from(hmacSign(payload));
  return given.length === expected.length && timingSafeEqual(given, expected);
}
