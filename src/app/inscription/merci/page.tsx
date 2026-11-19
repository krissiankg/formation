import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SignupSteps } from "@/components/inscription/SignupSteps";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { hasRegistrationAccess } from "@/lib/access/registration";
import { getSessionEnrollment } from "@/lib/auth/session";
import { contact, formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import { getWhatsAppGroupUrl } from "@/lib/settings/whatsapp-group";

export const metadata = {
  title: `Inscription enregistrée — ${formation.title}`,
  robots: { index: false },
};

export const dynamic = "force-dynamic";

/**
 * Page Merci, après le formulaire d'inscription : la seule suite possible est le groupe WhatsApp,
 * où le formateur donne le lieu et encaisse la préinscription. L'espace apprenant reste fermé
 * tant qu'il ne l'a pas validée dans l'admin.
 */
export default async function InscriptionMerciPage() {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/inscription");
  if (hasRegistrationAccess(enrollment)) redirect("/espace");

  const groupUrl = await getWhatsAppGroupUrl();
  const firstName = enrollment.fullName.trim().split(/\s+/)[0] || "";
  const slot = formation.schedule[enrollment.schedule];
  const fee = formatFcfa(formation.registrationFee);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:py-16">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 shadow-[0_20px_60px_rgba(23,29,23,0.06)] sm:p-8">
          <SignupSteps current={2} />

          <p className="section-kicker">Inscription enregistrée</p>
          <h1 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Merci{firstName ? ` ${firstName}` : ""}, c&apos;est presque fini !
          </h1>
          <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
            <strong className="text-[color:var(--neutral-black)]">Dernière étape obligatoire :</strong>{" "}
            {groupUrl
              ? "rejoins le groupe WhatsApp de la formation. C'est là que le formateur donne l'adresse exacte, le déroulé de la première séance et la façon de régler ta préinscription."
              : "écris au formateur sur WhatsApp. Il t'ajoute au groupe de la formation, où il donne l'adresse exacte, le déroulé de la première séance et la façon de régler ta préinscription."}
          </p>

          <a
            href={groupUrl ?? contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25d366] px-6 py-4 text-center text-lg font-bold text-[#0b3d1f] shadow-[0_12px_30px_rgba(37,211,102,0.35)] transition hover:bg-[#1fbe5b] active:scale-[0.98]"
          >
            <WhatsAppIcon className="size-7 shrink-0" />
            {groupUrl ? "Rejoindre le groupe WhatsApp" : "Écrire au formateur sur WhatsApp"}
          </a>
          <p className="mt-3 text-center text-sm text-[color:var(--neutral-600)]">
            Le bouton ne s&apos;ouvre pas ? Écris au formateur au{" "}
            <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="accent-text whitespace-nowrap font-semibold underline">
              {contact.whatsappDisplay}
            </a>
            .
          </p>

          <h2 className="font-display mt-10 text-xl">Et ensuite ?</h2>
          <ol className="mt-4 space-y-4">
            <Step n={1}>
              Dans le groupe, le formateur t&apos;explique comment régler ta préinscription de{" "}
              <span className="whitespace-nowrap">{fee}</span>. Ta place est réservée dès qu&apos;il l&apos;a validée.
            </Step>
            <Step n={2}>
              Tu reçois alors un email pour créer ton mot de passe et ouvrir ton espace apprenant.
            </Step>
            <Step n={3}>
              Première séance le {formation.startLabel} ({slot.label.toLowerCase()}, {slot.hours}) à Godomey. Viens avec
              ton ordinateur portable chargé.
            </Step>
          </ol>

          <dl className="mt-8 space-y-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-5 text-sm">
            <Row label="Nom" value={enrollment.fullName} />
            <Row label="Email" value={enrollment.email} />
            <Row label="WhatsApp" value={enrollment.whatsapp} />
            <Row label="Classe" value={`${slot.label} · ${slot.hours}`} />
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-[color:var(--neutral-500)]">
            Un email de confirmation avec le même lien vient de t&apos;être envoyé. Pense à regarder dans les spams.
            Une erreur dans tes informations ? Signale-la au formateur sur WhatsApp. Pour revoir le programme,{" "}
            <Link href="/#programme" className="accent-text underline">
              retourne à l&apos;accueil
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed text-[color:var(--neutral-700)]">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-lightest)] text-sm font-bold text-[color:var(--accent-darkest)]">
        {n}
      </span>
      <span className="min-w-0 pt-0.5">{children}</span>
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[color:var(--border)] pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-[color:var(--neutral-600)]">{label}</dt>
      <dd className="break-all font-medium text-[color:var(--neutral-black)] sm:text-right">{value}</dd>
    </div>
  );
}
