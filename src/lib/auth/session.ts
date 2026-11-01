import { cookies } from "next/headers";
import { STUDENT_SESSION_COOKIE } from "./session-cookies";
import { hmacMatches, hmacSign } from "./hmac";
import type { Enrollment } from "@/lib/types";
import { getEnrollment } from "@/lib/store/enrollments";

export const SESSION_COOKIE = STUDENT_SESSION_COOKIE;
const SESSION_DAYS = 30;

/**
 * Jeton de session apprenant signé : `student:<id>:<expiration>.<signature>`.
 * Le préfixe « student: » empêche de réutiliser un jeton admin (signé avec le même secret) et inversement.
 */
function createStudentToken(enrollmentId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60;
  const payload = `student:${enrollmentId}:${expiresAt}`;
  return `${payload}.${hmacSign(payload)}`;
}

/** Renvoie l'identifiant d'inscription si le jeton est authentique et non expiré. */
function readStudentToken(token: string | undefined): string | null {
  if (!token || !process.env.ADMIN_SESSION_SECRET?.trim()) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const [prefix, enrollmentId, exp] = payload.split(":");
  if (prefix !== "student" || !enrollmentId || !exp) return null;
  if (!(Number(exp) > Math.floor(Date.now() / 1000))) return null;
  if (!hmacMatches(payload, token.slice(dot + 1))) return null;
  return enrollmentId;
}

export async function createSession(enrollmentId: string) {
  const token = createStudentToken(enrollmentId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionEnrollment(): Promise<Enrollment | null> {
  const jar = await cookies();
  const id = readStudentToken(jar.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  return getEnrollment(id);
}
