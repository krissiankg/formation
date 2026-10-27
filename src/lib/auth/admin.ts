import { scrypt, timingSafeEqual, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionMaxAge,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

const scryptAsync = promisify(scrypt);

export { ADMIN_SESSION_COOKIE, verifyAdminSessionToken };

export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function verifyAdminPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash.startsWith("scrypt:")) return false;

  const [, salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");

  try {
    return timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

function getConfiguredAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return email || null;
}

function getConfiguredAdminPasswordHash(): string | null {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  return hash || null;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(getConfiguredAdminEmail() && getConfiguredAdminPasswordHash());
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const configuredEmail = getConfiguredAdminEmail();
  const configuredHash = getConfiguredAdminPasswordHash();

  if (!configuredEmail || !configuredHash) return false;

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== configuredEmail) return false;

  return verifyAdminPassword(password, configuredHash);
}

export async function createAdminSession() {
  const token = await createAdminSessionToken();
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAge,
  });
}

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  return await verifyAdminSessionToken(token);
}
