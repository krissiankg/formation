import type { Enrollment } from "@/lib/types";

/**
 * Accès à l'espace apprenant : préinscription payée, ou accès complet accordé par l'admin
 * (paiement en espèces, compte de test). Le blocage reste géré par getCourseAccess.
 */
export function hasRegistrationAccess(enrollment: Pick<Enrollment, "payments" | "accessOverride">): boolean {
  if (enrollment.accessOverride === "full") return true;
  return enrollment.payments.some((p) => p.kind === "registration" && p.status === "paid");
}
