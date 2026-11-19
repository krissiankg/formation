import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { InscriptionForm } from "@/components/InscriptionForm";
import { formation, openSlots } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import { getSeats } from "@/lib/enrollment/seats-server";

export const metadata = {
  title: `Inscription — ${formation.title}`,
  description: `Inscris-toi à ${formation.title} en une minute, sans paiement en ligne.`,
};

export const dynamic = "force-dynamic";

export default async function InscriptionPage() {
  const seats = await getSeats();
  const when = openSlots.length === 1 ? ` le ${openSlots[0].label.toLowerCase()}` : "";
  return (
    <>
      <SiteHeader />
      {/* Sur téléphone : titre, formulaire, puis détails. Sur grand écran : détails à gauche, formulaire à droite. */}
      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:py-16 [&>*]:min-w-0">
        <div>
          <p className="section-kicker">Inscription</p>
          <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Rejoins la cohorte du {formation.startLabel}
          </h1>
          <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
            Inscris-toi en une minute, sans rien payer en ligne. Tu rejoins ensuite le groupe WhatsApp de la
            formation : le formateur y donne l&apos;adresse et t&apos;explique comment régler ta préinscription de{" "}
            <span className="whitespace-nowrap">{formatFcfa(formation.registrationFee)}</span>.
          </p>
          <p className="mt-3 text-sm text-[color:var(--neutral-600)]">
            Déjà inscrit ? Le lien du groupe est dans ton email de confirmation. Place déjà validée ?{" "}
            <Link href="/connexion" className="accent-text hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 shadow-[0_20px_60px_rgba(23,29,23,0.06)] sm:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <InscriptionForm seats={seats} />
        </div>
        <div className="lg:col-start-1 lg:row-start-2">
          <p className="font-display text-lg">Ce que tu réserves</p>
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--neutral-600)]">
            <li>
              • {formation.sessionsCount} séances en présentiel{when} · {formation.startLabel} →{" "}
              {formation.endLabel}
            </li>
            <li>• {formation.seatsHint} · à Godomey, adresse exacte communiquée avant la première séance</li>
            <li>
              • Total : {formatFcfa(formation.totalPrice)}, payable en {formation.installments.length + 1} fois
            </li>
            <li>• Le groupe WhatsApp de la formation dès ton inscription, ton espace apprenant dès ta préinscription validée</li>
            <li>• {formation.refundGuarantee}</li>
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
