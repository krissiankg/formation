import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionEnrollment } from "@/lib/auth/session";
import { formation, brand } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import type { PaymentKind } from "@/lib/types";
import { PrintButton } from "./PrintButton";

export const metadata = {
  title: "Reçu de Paiement Officiel — FORGEIA",
};

export const dynamic = "force-dynamic";

const kindTitles: Record<PaymentKind, string> = {
  registration: "Frais d'inscription & réservation de place",
  start: "1ère Tranche — Démarrage de la formation",
  month1: "2ème Tranche — Fin du 1er mois",
  month3: "3ème Tranche & Solde — Début du 3ème mois",
};

export default async function RecuPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/connexion");

  const { kind } = await params;
  const payment = enrollment.payments.find((p) => p.kind === kind && p.status === "paid");

  if (!payment) {
    redirect("/espace/paiements");
  }

  // Calculs comptables
  const totalPaid = enrollment.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const remaining = Math.max(0, formation.totalPrice - totalPaid);

  const dateObj = payment.paidAt ? new Date(payment.paidAt) : new Date();
  const dateFormatted = dateObj.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const receiptNumber = `REC-${dateObj.getFullYear()}-${enrollment.id.slice(0, 6).toUpperCase()}-${payment.kind.toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-10 px-4 sm:px-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        {/* Barre d'action hors impression */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href="/espace/paiements"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition"
          >
            ← Retour à mes échéances
          </Link>
          <div className="flex gap-3">
            <PrintButton />
          </div>
        </div>

        {/* Facture / Reçu A4 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-12 print:border-none print:shadow-none print:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl font-black tracking-wider text-black">
                  FORGE<span className="text-[#00ff88]">IA</span>
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                  REÇU OFFICIEL
                </span>
              </div>
              <p className="mt-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
                Académie d'Excellence IA & SaaS
              </p>
              <p className="mt-1 text-xs text-gray-500">Cotonou, Bénin · contact@forgeia.guelichweb.store</p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs uppercase font-mono tracking-wider text-gray-400">Référence Reçu</p>
              <p className="font-mono text-base font-bold text-gray-900">{receiptNumber}</p>
              <p className="mt-1 text-xs text-gray-500">Date d'émission : {dateFormatted}</p>
            </div>
          </div>

          {/* Bénéficiaire & Programme */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 rounded-xl bg-gray-50 p-6 border border-gray-100">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-gray-400">Émis au nom de</p>
              <p className="mt-1 text-base font-bold text-gray-900">{enrollment.fullName}</p>
              <p className="text-xs text-gray-600">{enrollment.email}</p>
              <p className="text-xs text-gray-600">{enrollment.whatsapp}</p>
            </div>

            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-gray-400">Programme & Cohorte</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{brand.name} — {brand.tagline}</p>
              <p className="text-xs text-gray-600">
                Créneau : {enrollment.schedule === "saturday" ? "Samedi 9h–14h" : "Dimanche 9h–14h"}
              </p>
              <p className="text-xs text-gray-600">Durée : 3 mois présentiels (Octobre 2026)</p>
            </div>
          </div>

          {/* Tableau de la transaction */}
          <div className="mt-8">
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">
              Détail du règlement
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600">
                  <th className="py-3">Désignation</th>
                  <th className="py-3 text-center">Statut</th>
                  <th className="py-3 text-right">Montant Réglé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                <tr>
                  <td className="py-4 font-medium text-gray-900">
                    {kindTitles[payment.kind as PaymentKind] || payment.kind}
                    <div className="text-xs text-gray-500 font-normal">
                      Moyen : Mobile Money / Carte (FedaPay)
                      {payment.fedapayId ? ` · Réf: ${payment.fedapayId}` : ""}
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      ✓ Payé & Confirmé
                    </span>
                  </td>
                  <td className="py-4 text-right font-mono font-bold text-gray-900">
                    {formatFcfa(payment.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Synthèse comptable */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex flex-col gap-2 sm:w-72 sm:ml-auto text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Coût total formation :</span>
                <span className="font-mono">{formatFcfa(formation.totalPrice)}</span>
              </div>
              <div className="flex justify-between font-medium text-emerald-600">
                <span>Cumul déjà réglé :</span>
                <span className="font-mono font-bold">{formatFcfa(totalPaid)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                <span>Reste à payer :</span>
                <span className="font-mono text-base text-gray-900">{formatFcfa(remaining)}</span>
              </div>
            </div>
          </div>

          {/* Cachet & signature */}
          <div className="mt-12 pt-8 border-t border-dashed border-gray-200 flex flex-col sm:flex-row justify-between items-end gap-6">
            <div className="text-xs text-gray-400 max-w-sm">
              Ce document fait foi de reçu de paiement pour la participation à la formation présentielle FORGEIA. 
              Conservez précieusement ce reçu.
            </div>
            <div className="text-center sm:text-right">
              <div className="inline-block border border-emerald-500/30 bg-emerald-50/50 rounded-lg px-4 py-2 text-center">
                <p className="text-[10px] uppercase font-mono tracking-wider text-emerald-800 font-bold">
                  FORGEIA CERTIFICATION
                </p>
                <p className="text-[9px] text-emerald-600">PAIEMENT VALIDÉ AUTOMATIQUEMENT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
