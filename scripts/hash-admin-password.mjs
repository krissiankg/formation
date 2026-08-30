#!/usr/bin/env node
/**
 * Generate ADMIN_PASSWORD_HASH for .env.local
 * Usage: node scripts/hash-admin-password.mjs "your-password"
 */
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs \"your-password\"");
  process.exit(1);
}

const hash = await hashPassword(password);
console.log(hash);
