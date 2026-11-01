import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Ancienne page de retour de paiement (liens envoyés avant le nouveau parcours) :
 * le paiement se suit désormais depuis le compte, sur /inscription/paiement.
 */
export default function ConfirmationPage() {
  redirect("/inscription/paiement");
}
