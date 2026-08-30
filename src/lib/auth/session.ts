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

export async function createSession(enrollmentId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, enrollmentId, {
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
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return getEnrollment(id);
}
