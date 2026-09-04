import type { Enrollment, EnrollmentStatus, PaymentStatus, PaymentKind } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { initStudentProgress } from "@/lib/store/progress";

type EnrollmentRow = {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  schedule: "saturday" | "sunday";
  status: EnrollmentStatus;
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
  schedule: "saturday" | "sunday";
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

export type { PaymentKind };
