import { createHash } from "node:crypto";
import { hmacMatches, hmacSign } from "@/lib/auth/hmac";

/**
 * Lien « mot de passe oublié » : `reset:<id>:<expiration>:<empreinte>.<signature>`, valable 1 heure.
 * L'empreinte du mot de passe actuel rend le lien inutilisable dès que le mot de passe change.
 */
const VALIDITY_SECONDS = 60 * 60;

export function passwordFingerprint(passwordHash: string | undefined): string {
  return createHash("sha256").update(passwordHash ?? "aucun").digest("hex").slice(0, 16);
}

export function createPasswordResetToken(
  enrollment: { id: string; passwordHash?: string },
  nowMs: number = Date.now(),
): string {
  const exp = Math.floor(nowMs / 1000) + VALIDITY_SECONDS;
  const payload = `reset:${enrollment.id}:${exp}:${passwordFingerprint(enrollment.passwordHash)}`;
  return `${payload}.${hmacSign(payload)}`;
}

export function readPasswordResetToken(
  token: string,
  nowMs: number = Date.now(),
): { enrollmentId: string; fingerprint: string } | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const [prefix, enrollmentId, exp, fingerprint, extra] = payload.split(":");
  if (prefix !== "reset" || !enrollmentId || !exp || !fingerprint || extra !== undefined) return null;
  if (!(Number(exp) > Math.floor(nowMs / 1000))) return null;
  if (!hmacMatches(payload, token.slice(dot + 1))) return null;
  return { enrollmentId, fingerprint };
}
