import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { InscriptionForm } from "@/components/InscriptionForm";
import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";

export const metadata = {
  title: `Inscription — ${formation.title}`,
  description: `Réserve ta place pour ${formation.title}. Frais d'inscription ${formatFcfa(formation.registrationFee)}.`,
};

export default function InscriptionPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <div>
          <p className="section-kicker">10 — Démarrer l&apos;inscription</p>
          <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Rejoins la cohorte {formation.startLabel}
          </h1>
          <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
            Remplis le formulaire, choisis samedi ou dimanche, puis paie{" "}
            {formatFcfa(formation.registrationFee)} pour verrouiller ta place.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-[color:var(--neutral-600)]">
            <li>• Formation présentielle · {formation.startLabel} → {formation.endLabel}</li>
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
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 shadow-[0_20px_60px_rgba(23,29,23,0.06)] sm:p-8">
          <InscriptionForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
