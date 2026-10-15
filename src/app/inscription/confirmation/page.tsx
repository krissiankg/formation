import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getEnrollment, markRegistrationPaid } from "@/lib/store/enrollments";
import { notifyTelegram, notifyWhatsApp, notifyAdminWhatsApp } from "@/lib/integrations";
import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";

type Props = {
  searchParams: Promise<{ id?: string; mock_payment?: string; tx?: string }>;
};

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const id = params.id;

  if (!id) {
    return (
      <Shell>
        <p className="text-[color:var(--neutral-600)]">Inscription introuvable.</p>
        <Link href="/inscription" className="btn-primary mt-6 inline-flex">
          Retour à l&apos;inscription
        </Link>
      </Shell>
    );
  }

  let enrollment = await getEnrollment(id);

  if (!enrollment) {
    return (
      <Shell>
        <p className="text-[color:var(--neutral-600)]">Inscription introuvable.</p>
        <Link href="/inscription" className="btn-primary mt-6 inline-flex">
          Retour à l&apos;inscription
        </Link>
      </Shell>
    );
  }

  // Le paiement simulé n'existe que sans clé FedaPay (dev / démo) : en production,
  // seul le webhook FedaPay signé peut marquer l'inscription comme payée.
  const mockPaymentsAllowed = process.env.NODE_ENV !== "production" && !process.env.FEDAPAY_SECRET_KEY;
  if (
    mockPaymentsAllowed &&
    params.mock_payment === "1" &&
    enrollment.status === "awaiting_registration_payment"
  ) {
    enrollment =
      (await markRegistrationPaid(id, params.tx)) ?? enrollment;

    await notifyTelegram(
      `<b>Nouvelle inscription FORGE IA</b>\n` +
        `Nom: ${enrollment.fullName}\n` +
        `Email: ${enrollment.email}\n` +
        `WhatsApp: ${enrollment.whatsapp}\n` +
        `Créneau: ${formation.schedule[enrollment.schedule].label}\n` +
        `Payé: ${formatFcfa(formation.registrationFee)}`,
    );

    await notifyAdminWhatsApp(
      `FORGE IA — Nouvelle inscription payée\n` +
        `Nom: ${enrollment.fullName}\n` +
        `Email: ${enrollment.email}\n` +
        `WhatsApp: ${enrollment.whatsapp}\n` +
        `Créneau: ${formation.schedule[enrollment.schedule].label}\n` +
        `Montant: ${formatFcfa(formation.registrationFee)}`,
    );

    await notifyWhatsApp(
      enrollment.whatsapp,
      `Bienvenue sur FORGE IA ! Ton inscription est confirmée (${formation.schedule[enrollment.schedule].label}). Connecte-toi sur la plateforme pour suivre le programme.`,
    );
  }

  const paid =
    enrollment.payments.find((p) => p.kind === "registration")?.status === "paid";

  return (
    <Shell>
      <p className="section-kicker">
        {paid ? "Inscription confirmée" : "Paiement en attente"}
      </p>
      <h1 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {paid
          ? `Merci, ${enrollment.fullName.split(" ")[0]} !`
          : "Finalise ton paiement"}
      </h1>
      <p className="mt-4 text-[color:var(--neutral-600)] leading-relaxed">
        {paid
          ? "Ta place est réservée. Tu peux te connecter avec ton email et ton WhatsApp pour accéder à l'espace apprenant."
          : "Si tu reviens du paiement Mobile Money, la confirmation peut prendre quelques secondes."}
      </p>

      <dl className="mt-8 space-y-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-5 text-sm">
        <Row label="Email" value={maskEmail(enrollment.email)} />
        <Row label="WhatsApp" value={maskPhone(enrollment.whatsapp)} />
        <Row
          label="Créneau"
          value={`${formation.schedule[enrollment.schedule].label} · ${formation.schedule[enrollment.schedule].hours}`}
        />
        <Row
          label="Frais d'inscription"
          value={`${formatFcfa(formation.registrationFee)} · ${paid ? "Payé" : "En attente"}`}
        />
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/connexion" className={paid ? "btn-primary" : "btn-ghost"}>
          {paid ? "Me connecter à mon espace" : "Page de connexion"}
        </Link>
        <Link href="/" className="btn-ghost">
          Retour à l&apos;accueil
        </Link>
      </div>
    </Shell>
  );
}

// Ce lien circule (WhatsApp, relances) : on n'y affiche pas les identifiants de connexion en clair.
function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return "•••";
  return `${user.slice(0, 2)}${"•".repeat(Math.max(3, user.length - 2))}@${domain}`;
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 2 ? `•••• •• ${digits.slice(-2)}` : "••••";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[color:var(--border)] pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between">
      <dt className="text-[color:var(--neutral-600)]">{label}</dt>
      <dd className="font-medium text-[color:var(--neutral-black)]">{value}</dd>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">{children}</main>
      <SiteFooter />
    </>
  );
}
