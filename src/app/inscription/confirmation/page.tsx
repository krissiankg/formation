import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Ancienne page de retour de paiement (liens envoyés avant le nouveau parcours) :
 * la suite de l'inscription se passe désormais sur la page Merci (groupe WhatsApp).
 */
export default function ConfirmationPage() {
  redirect("/inscription/merci");
}
