export type ScheduleId = "saturday" | "saturday_pm" | "sunday";

export type InscriptionInput = {
  fullName: string;
  email: string;
  whatsapp: string;
  schedule: ScheduleId;
  acceptTerms: boolean;
  password: string;
};

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_TOO_SHORT = "Le mot de passe doit contenir au moins 8 caractères.";
export const PASSWORDS_MISMATCH = "Les deux mots de passe ne correspondent pas.";

/** Mot de passe choisi par l'apprenant (inscription, réinitialisation) : null si valide, sinon le message d'erreur. */
export function passwordError(password: string, confirm: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return PASSWORD_TOO_SHORT;
  if (password !== confirm) return PASSWORDS_MISMATCH;
  return null;
}

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
  const password = String(b.password ?? "");
  const passwordConfirm = String(b.passwordConfirm ?? "");

  if (fullName.length < 2) return { error: "Nom trop court" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email invalide" };
  if (whatsapp.length < 8 || !/^[+\d\s()-]+$/.test(whatsapp)) {
    return { error: "Numéro WhatsApp invalide" };
  }
  if (schedule !== "saturday" && schedule !== "saturday_pm" && schedule !== "sunday") {
    return { error: "Choisis ton créneau (samedi matin, samedi après-midi ou dimanche matin)" };
  }
  const badPassword = passwordError(password, passwordConfirm);
  if (badPassword) return { error: badPassword };
  if (!acceptTerms) return { error: "Tu dois accepter les conditions" };

  return {
    data: { fullName, email, whatsapp, schedule, acceptTerms, password },
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

export type AccessOverride = "full" | "blocked";

export interface Enrollment {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  schedule: ScheduleId;
  status: EnrollmentStatus;
  avatarUrl?: string;
  passwordHash?: string;
  /** Choix admin prioritaire sur les paiements ; absent = automatique. */
  accessOverride?: AccessOverride;
  /** Crédit IA propre à l'apprenant (FCFA) ; absent = budget par défaut de la formation. */
  iaBudgetFcfa?: number;
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
