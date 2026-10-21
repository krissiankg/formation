import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { InscriptionForm } from "@/components/InscriptionForm";
import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import { getSeats } from "@/lib/enrollment/seats-server";

export const metadata = {
  title: `Inscription — ${formation.title}`,
  description: `Réserve ta place pour ${formation.title}. Préinscription ${formatFcfa(formation.registrationFee)}.`,
};

export const dynamic = "force-dynamic";

export default async function InscriptionPage() {
  const seats = await getSeats();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] [&>*]:min-w-0 lg:py-16">
        <div>
          <p className="section-kicker">10 — Démarrer l&apos;inscription</p>
          <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Rejoins la cohorte {formation.startLabel}
          </h1>
          <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
            Remplis le formulaire, choisis ta classe (samedi matin, samedi après-midi ou dimanche matin),
            puis paie la préinscription de {formatFcfa(formation.registrationFee)} pour réserver ta place.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-[color:var(--neutral-600)]">
            <li>• {formation.sessionsCount} séances en présentiel · {formation.startLabel} → {formation.endLabel}</li>
            <li>• {formation.seatsHint} · lieu communiqué avant la première séance</li>
            <li>• Total : {formatFcfa(formation.totalPrice)}</li>
            <li>• WhatsApp obligatoire pour les notifications de contenu</li>
            <li>• Paiement par Mobile Money</li>
          </ul>
          <p className="mt-8 text-sm text-[color:var(--neutral-600)]">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="accent-text hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 shadow-[0_20px_60px_rgba(23,29,23,0.06)] sm:p-8">
          <InscriptionForm seats={seats} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
