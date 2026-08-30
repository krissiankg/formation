#!/usr/bin/env node
/**
 * Create or refresh a paid test apprenant enrollment in Supabase.
 * Usage: node scripts/create-test-apprenant.mjs
 *
 * Loads .env.local from project root (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const TEST = {
  fullName: "Jean Test",
  email: "test.apprenant@forgeia.local",
  whatsapp: "+22997000001",
  schedule: "saturday",
};

const REGISTRATION_FEE = 5_000;
const INSTALLMENTS = [70_000, 50_000, 20_000];
const now = new Date().toISOString();

function buildPayments() {
  return [
    {
      kind: "registration",
      amount: REGISTRATION_FEE,
      status: "paid",
      paidAt: now,
      fedapayId: "test-seed",
    },
    { kind: "start", amount: INSTALLMENTS[0], status: "pending" },
    { kind: "month1", amount: INSTALLMENTS[1], status: "pending" },
    { kind: "month3", amount: INSTALLMENTS[2], status: "pending" },
  ];
}

loadEnvLocal();

const baseUrl = (
  process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
)?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_INTERNAL_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const restUrl = `${baseUrl}/rest/v1`;

function supabaseHeaders(prefer) {
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

async function rest(path, { method = "GET", body, prefer } = {}) {
  const response = await fetch(`${restUrl}${path}`, {
    method,
    headers: supabaseHeaders(prefer),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.message
        ? data.message
        : typeof data === "string"
          ? data
          : response.statusText;
    throw new Error(message || `HTTP ${response.status}`);
  }

  return data;
}

const payload = {
  full_name: TEST.fullName,
  email: TEST.email,
  whatsapp: TEST.whatsapp,
  schedule: TEST.schedule,
  status: "registered",
  payments: buildPayments(),
};

let enrollmentId;

const existing = await rest(
  `/enrollments?email=eq.${encodeURIComponent(TEST.email)}&select=id`,
);

if (Array.isArray(existing) && existing[0]?.id) {
  const updated = await rest(
    `/enrollments?id=eq.${existing[0].id}&select=id`,
    {
      method: "PATCH",
      body: payload,
      prefer: "return=representation",
    },
  );
  enrollmentId = updated[0]?.id;
  console.log("Updated existing test apprenant.");
} else {
  const created = await rest("/enrollments?select=id", {
    method: "POST",
    body: payload,
    prefer: "return=representation",
  });
  enrollmentId = created[0]?.id;
  console.log("Created test apprenant.");
}

if (!enrollmentId) {
  console.error("No enrollment id returned.");
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      enrollmentId,
      fullName: TEST.fullName,
      email: TEST.email,
      whatsapp: TEST.whatsapp,
      loginUrl: "https://forgeia.guelichweb.store/connexion",
      espaceUrl: "https://forgeia.guelichweb.store/espace",
    },
    null,
    2,
  ),
);
