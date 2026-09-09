export type ScheduleId = "saturday" | "sunday";

export type InscriptionInput = {
  fullName: string;
  email: string;
  whatsapp: string;
  schedule: ScheduleId;
  acceptTerms: boolean;
};

export function validateInscription(body: unknown): {
  data?: InscriptionInput;
  error?: string;
} {
  if (!body || typeof body !== "object") {
    return { error: "Données invalides" };
  }

  const b = body as Record<string, unknown>;
  const fullName = String(b.fullName ?? "").trim();
  const email = String(b.email ?? "").trim();
  const whatsapp = String(b.whatsapp ?? "").trim();
  const schedule = String(b.schedule ?? "") as ScheduleId;
  const acceptTerms = Boolean(b.acceptTerms);

  if (fullName.length < 2) return { error: "Nom trop court" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email invalide" };
  if (whatsapp.length < 8 || !/^[+\d\s()-]+$/.test(whatsapp)) {
    return { error: "Numéro WhatsApp invalide" };
  }
  if (schedule !== "saturday" && schedule !== "sunday") {
    return { error: "Choisis ton créneau (samedi ou dimanche)" };
  }
  if (!acceptTerms) return { error: "Tu dois accepter les conditions" };

  return {
    data: { fullName, email, whatsapp, schedule, acceptTerms },
  };
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type EnrollmentStatus =
  | "draft"
  | "awaiting_registration_payment"
  | "registered"
  | "active"
  | "blocked";

export type PaymentKind = "registration" | "start" | "month1" | "month3";

export interface Enrollment {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  schedule: ScheduleId;
  status: EnrollmentStatus;
  avatarUrl?: string;
  passwordHash?: string;
  createdAt: string;
  payments: {
    kind: PaymentKind;
    amount: number;
    status: PaymentStatus;
    paidAt?: string;
    fedapayId?: string;
  }[];
}

export type ProjectStatus =
  | "submitted"
  | "in_review"
  | "approved"
  | "changes_requested";

export interface StudentProject {
  id: string;
  enrollmentId: string;
  title: string;
  description?: string | null;
  projectUrl: string;
  githubUrl?: string | null;
  demoCredentials?: string | null;
  status: ProjectStatus;
  score?: number | null;
  feedback?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  studentName?: string;
  studentWhatsapp?: string;
}

export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface StudentTestimonial {
  id: string;
  enrollmentId: string;
  rating: number;
  content: string;
  roleOrProject?: string | null;
  status: TestimonialStatus;
  createdAt: string;
  updatedAt: string;
  studentName?: string;
  studentEmail?: string;
}
