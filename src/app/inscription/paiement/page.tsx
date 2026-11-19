import { redirect } from "next/navigation";
import { hasRegistrationAccess } from "@/lib/access/registration";
import { getSessionEnrollment } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Ancienne page de paiement de la préinscription (liens des anciens emails) : la préinscription se règle
 * désormais au formateur, dans le groupe WhatsApp. On renvoie vers la page Merci, ou vers l'espace si
 * elle est déjà validée.
 */
export default async function InscriptionPaiementPage() {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/connexion");
  redirect(hasRegistrationAccess(enrollment) ? "/espace" : "/inscription/merci");
}
