import { sendEmail, type EmailMessage } from "@/lib/email/brevo";

/** Email à un apprenant. */
export function notifyStudent(student: { email: string; fullName: string }, message: EmailMessage) {
  return sendEmail({ email: student.email, name: student.fullName }, message);
}

/** Alerte pour l'administrateur (ADMIN_EMAIL). */
export async function notifyAdmin(message: EmailMessage) {
  const email = process.env.ADMIN_EMAIL?.trim();
  if (!email) return { ok: true, stub: true };
  return sendEmail({ email, name: "FORGE IA" }, message);
}
