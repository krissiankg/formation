import { createHash } from "node:crypto";
import { hmacMatches, hmacSign } from "@/lib/auth/hmac";

/**
 * Lien « mot de passe oublié » : `reset:<id>:<expiration>:<empreinte>.<signature>`, valable 1 heure.
 * L'empreinte du mot de passe actuel rend le lien inutilisable dès que le mot de passe change.
 */
const VALIDITY_SECONDS = 60 * 60;
/**
 * Lien de création du premier mot de passe, envoyé quand le formateur valide la préinscription :
 * 7 jours, car l'apprenant ne lit pas forcément ses emails tout de suite. Il ne sert qu'une fois,
 * l'empreinte changeant dès que le mot de passe est créé.
 */
export const SETUP_LINK_VALIDITY_SECONDS = 7 * 24 * 60 * 60;

export function passwordFingerprint(passwordHash: string | undefined): string {
  return createHash("sha256").update(passwordHash ?? "aucun").digest("hex").slice(0, 16);
}

export function createPasswordResetToken(
  enrollment: { id: string; passwordHash?: string },
  nowMs: number = Date.now(),
  validitySeconds: number = VALIDITY_SECONDS,
): string {
  const exp = Math.floor(nowMs / 1000) + validitySeconds;
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
