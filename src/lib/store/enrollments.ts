import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { AccessOverride, Enrollment, EnrollmentStatus, PaymentStatus, PaymentKind, ScheduleId } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { initStudentProgress } from "@/lib/store/progress";
import { MANUAL_PAYMENT_REF } from "@/lib/programme/installments";

type EnrollmentRow = {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  schedule: ScheduleId;
  status: EnrollmentStatus;
  avatar_url?: string | null;
  password_hash?: string | null;
  access_override?: AccessOverride | null;
  ia_budget_fcfa?: number | null;
  payments: Enrollment["payments"];
  created_at: string;
};

function mapRow(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp,
    schedule: row.schedule,
    status: row.status,
    avatarUrl: row.avatar_url ?? undefined,
    passwordHash: row.password_hash ?? undefined,
    accessOverride: row.access_override ?? undefined,
    iaBudgetFcfa: row.ia_budget_fcfa ?? undefined,
    createdAt: row.created_at,
    payments: row.payments ?? [],
  };
}

export async function listEnrollments(): Promise<Enrollment[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as EnrollmentRow[]).map(mapRow);
}

export async function createEnrollment(input: {
  fullName: string;
  email: string;
  whatsapp: string;
  schedule: ScheduleId;
  payments: Enrollment["payments"];
}): Promise<Enrollment> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("enrollments")
    .insert({
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      whatsapp: input.whatsapp.trim(),
      schedule: input.schedule,
      status: "awaiting_registration_payment",
      payments: input.payments,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as EnrollmentRow);
}

export async function markPaymentPaid(
  id: string,
  kind: PaymentKind,
  fedapayId?: string,
) {
  const enrollment = await getEnrollment(id);
  if (!enrollment) return null;

  const payments = enrollment.payments.map((p) =>
    p.kind === kind
      ? {
          ...p,
          status: "paid" as PaymentStatus,
          paidAt: new Date().toISOString(),
          fedapayId,
        }
      : p,
  );

  const nextStatus: EnrollmentStatus =
    kind === "registration" ? "registered" : "active";

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("enrollments")
    .update({ status: nextStatus, payments })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  const updated = mapRow(data as EnrollmentRow);
  if (kind === "registration") {
    await initStudentProgress(updated.id);
  }
  return updated;
}

/** Annule un paiement saisi à la main (erreur de clic). Les paiements FedaPay ne sont jamais annulés ici. */
export async function revertManualPayment(id: string, kind: PaymentKind) {
  const enrollment = await getEnrollment(id);
  if (!enrollment) return null;
  const target = enrollment.payments.find((p) => p.kind === kind);
  if (target?.status !== "paid" || target.fedapayId !== MANUAL_PAYMENT_REF) {
    throw new Error("Seul un paiement marqué à la main peut être annulé.");
  }

  const payments = enrollment.payments.map((p) =>
    p.kind === kind ? { kind: p.kind, amount: p.amount, status: "pending" as PaymentStatus } : p,
  );
  const status: EnrollmentStatus =
    kind === "registration"
      ? "awaiting_registration_payment"
      : payments.some((p) => p.kind !== "registration" && p.status === "paid")
        ? "active"
        : "registered";

  const { data, error } = await getSupabaseAdmin()
    .from("enrollments")
    .update({ status, payments })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as EnrollmentRow);
}

export async function markRegistrationPaid(id: string, fedapayId?: string) {
  return markPaymentPaid(id, "registration", fedapayId);
}

export async function getEnrollment(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRow(data as EnrollmentRow);
}

export async function findEnrollmentByEmailAndWhatsapp(
  email: string,
  whatsapp: string,
) {
  const items = await listEnrollments();
  const normalizedEmail = email.trim().toLowerCase();
  const digits = whatsapp.replace(/\D/g, "");

  return (
    items.find((e) => {
      if (e.email !== normalizedEmail) return false;
      const ew = e.whatsapp.replace(/\D/g, "");
      return ew === digits || ew.slice(-8) === digits.slice(-8);
    }) ?? null
  );
}

export async function findEnrollmentByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as EnrollmentRow);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, combined: string): boolean {
  try {
    const [salt, key] = combined.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

export async function updateEnrollmentProfile(
  id: string,
  updates: {
    fullName?: string;
    whatsapp?: string;
    avatarUrl?: string;
    password?: string;
  }
): Promise<Enrollment> {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, any> = {};

  if (updates.fullName && updates.fullName.trim().length >= 2) {
    payload.full_name = updates.fullName.trim();
  }
  if (updates.whatsapp && updates.whatsapp.trim().length >= 8) {
    payload.whatsapp = updates.whatsapp.trim();
  }
  if (updates.avatarUrl !== undefined) {
    payload.avatar_url = updates.avatarUrl;
  }
  if (updates.password && updates.password.trim().length >= 6) {
    payload.password_hash = hashPassword(updates.password.trim());
  }

  if (Object.keys(payload).length === 0) {
    const existing = await getEnrollment(id);
    if (!existing) throw new Error("Inscription introuvable");
    return existing;
  }

  const { data, error } = await supabase
    .from("enrollments")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as EnrollmentRow);
}

export type { PaymentKind };


/** Choix admin sur l'accès à la formation (null = automatique, selon les paiements). */
export async function setAccessOverride(id: string, override: AccessOverride | null) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("enrollments")
    .update({ access_override: override })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as EnrollmentRow);
}
