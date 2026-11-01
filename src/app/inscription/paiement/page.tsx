import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { RegistrationPayment } from "@/components/inscription/RegistrationPayment";
import { SignupSteps } from "@/components/inscription/SignupSteps";
import { hasRegistrationAccess } from "@/lib/access/registration";
import { getSessionEnrollment } from "@/lib/auth/session";
import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import { markRegistrationPaid } from "@/lib/store/enrollments";

type Props = {
  searchParams: Promise<{ retour?: string; mock_payment?: string; tx?: string }>;
};

export const metadata = {
  title: `Paiement de la préinscription — ${formation.title}`,
};

export const dynamic = "force-dynamic";

export default async function InscriptionPaiementPage({ searchParams }: Props) {
  const params = await searchParams;
  let enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/connexion");

  // Le paiement simulé n'existe que sans clé FedaPay (dev / démo) : en production,
  // seul le webhook FedaPay signé peut marquer la préinscription comme payée.
  const mockPaymentsAllowed = process.env.NODE_ENV !== "production" && !process.env.FEDAPAY_SECRET_KEY;
  if (mockPaymentsAllowed && params.mock_payment === "1" && !hasRegistrationAccess(enrollment)) {
    enrollment = (await markRegistrationPaid(enrollment.id, params.tx)) ?? enrollment;
  }

  const paid = hasRegistrationAccess(enrollment);
  const firstName = enrollment.fullName.trim().split(/\s+/)[0] || "à toi";
  const slot = formation.schedule[enrollment.schedule];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 shadow-[0_20px_60px_rgba(23,29,23,0.06)] sm:p-8">
          <SignupSteps current={paid ? 3 : 2} />

          {paid ? (
            <>
              <p className="section-kicker">Préinscription payée</p>
              <h1 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Paiement confirmé, bienvenue {firstName} !
              </h1>
              <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
                Ta place est réservée pour la cohorte {formation.startLabel} ({slot.label}). Ton espace apprenant est ouvert :
                tu y trouveras le programme, les ressources et le lien du groupe WhatsApp FORGEIA.
              </p>
              <div className="mt-8">
                <Link href="/espace" className="btn-primary">
                  Accéder à mon espace
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="section-kicker">Dernière étape</p>
              <h1 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Réserve ta place</h1>
              <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
                Ton compte est créé. Règle la préinscription par Mobile Money pour réserver ta place et ouvrir ton espace
                apprenant.
              </p>
              <dl className="mt-8 space-y-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-5 text-sm">
                <Row label="Nom" value={enrollment.fullName} />
                <Row label="Email" value={enrollment.email} />
                <Row label="Créneau" value={`${slot.label} · ${slot.hours}`} />
                <Row label="Préinscription" value={formatFcfa(formation.registrationFee)} />
              </dl>
              <RegistrationPayment checking={params.retour === "1"} />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[color:var(--border)] pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between">
      <dt className="text-[color:var(--neutral-600)]">{label}</dt>
      <dd className="font-medium text-[color:var(--neutral-black)]">{value}</dd>
    </div>
  );
}
