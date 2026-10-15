import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Enrollment } from "@/lib/types";
import {
  findEnrollmentByEmailAndWhatsapp,
  getEnrollment,
} from "@/lib/store/enrollments";

export const SESSION_COOKIE = "forge_session";
const SESSION_DAYS = 30;

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function phonesMatch(a: string, b: string) {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // Compare last 8–11 digits to tolerate missing country code
  const shortA = na.slice(-8);
  const shortB = nb.slice(-8);
  return shortA.length >= 8 && shortA === shortB;
}

export async function findEnrollmentByCredentials(email: string, whatsapp: string) {
  return findEnrollmentByEmailAndWhatsapp(email, whatsapp);
}

/**
 * Jeton de session apprenant signé : `student:<id>:<expiration>.<signature>`.
 * Le préfixe « student: » empêche de réutiliser un jeton admin (signé avec le même secret) et inversement.
 */
function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function createStudentToken(enrollmentId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60;
  const payload = `student:${enrollmentId}:${expiresAt}`;
  return `${payload}.${sign(payload)}`;
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
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return enrollmentId;
}

export async function createSession(enrollmentId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createStudentToken(enrollmentId), {
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
