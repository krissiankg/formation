import type { Enrollment } from "@/lib/types";

/**
 * Accès à l'espace apprenant : préinscription payée (ou une tranche réglée avant elle par l'ancien
 * parcours), ou accès complet accordé par l'admin (paiement en espèces, compte de test).
 * Le blocage et l'ouverture des modules restent gérés par getCourseAccess.
 */
export function hasRegistrationAccess(enrollment: Pick<Enrollment, "payments" | "accessOverride">): boolean {
  if (enrollment.accessOverride === "full") return true;
  return enrollment.payments.some((p) => p.status === "paid");
}
