import Link from "next/link";
import { MobileCtaBar } from "@/components/landing/MobileCtaBar";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { WhatsAppLink } from "@/components/WhatsAppFloat";
import { formation } from "@/lib/config/formation";
import type { Seats } from "@/lib/enrollment/seats";
import { getSeats } from "@/lib/enrollment/seats-server";
import { formatFcfa } from "@/lib/format";
import { countdownLabel, daysUntilStart, seatsLabel } from "@/lib/landing";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { listApprovedTestimonials } from "@/lib/testimonials/store";
import type { StudentTestimonial } from "@/lib/types";

// Page servie depuis le cache et régénérée toutes les 5 minutes : rapide pour le trafic des pubs,
// avec un compte à rebours et des places restantes à jour.
export const revalidate = 300;

const ctaLabel = `Réserver ma place — ${formatFcfa(formation.registrationFee)}`;

export default async function HomePage() {
  const [seats, testimonials] = await Promise.all([loadSeats(), loadTestimonials()]);
  const countdown = countdownLabel(daysUntilStart(formation.startDate, new Date()));

  return (
    <>
      <SiteHeader />
      <main>
        <Hero countdown={countdown} seats={seats} />
        <Projects />
        <Audience />
        <Programme />
        <Pricing />
        <Steps />
        <TestimonialsSection testimonials={testimonials} />
        <Faq />
        <FinalCta countdown={countdown} />
      </main>
      <SiteFooter />
      <MobileCtaBar label={ctaLabel} hint={countdown} />
    </>
  );
}

async function loadSeats(): Promise<Seats | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    return await getSeats();
  } catch (error) {
    console.error("Accueil : places indisponibles", error);
    return null;
  }
}

async function loadTestimonials(): Promise<StudentTestimonial[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    return await listApprovedTestimonials();
  } catch (error) {
    console.error("Accueil : avis indisponibles", error);
    return [];
  }
}

function Hero({ countdown, seats }: { countdown: string | null; seats: Seats | null }) {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--border)]">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24 lg:pt-20 [&>*]:min-w-0">
        <div className="fade-up max-w-2xl">
          <p className="section-kicker mb-4">Formation en présentiel à Cotonou</p>
          <h1 className="font-display text-[1.9rem] font-extrabold leading-[1.12] tracking-tight text-[color:var(--neutral-black)] sm:text-5xl lg:text-[3.3rem]">
            Crée des sites et des applications avec l&apos;IA.{" "}
            <span className="whitespace-nowrap text-[color:var(--accent)]">Et vends-les.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:var(--neutral-600)]">
            {formation.sessionsCount} séances le week-end, sans savoir coder. Tu repars avec 3 projets en ligne
            et une offre prête à vendre.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm text-[color:var(--neutral-700)]">
            {["Aucune base en code", "Viens avec ton ordinateur", `${formation.maxPerClass} places par classe`].map(
              (item) => (
                <li
                  key={item}
                  className="rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_srgb,white_70%,transparent)] px-3 py-1.5"
                >
                  {item}
                </li>
              ),
            )}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/inscription" className="btn-primary w-full text-sm sm:w-auto sm:text-base">
              {ctaLabel}
            </Link>
            <a href="#programme" className="btn-ghost w-full sm:w-auto">
              Voir le programme
            </a>
          </div>
          <p className="mt-3 text-sm text-[color:var(--neutral-500)]">
            Paiement Mobile Money · inscription en 2 minutes
          </p>
        </div>
        <div className="fade-up" style={{ animationDelay: "120ms" }}>
          <CohortCard countdown={countdown} seats={seats} />
        </div>
      </div>
    </section>
  );
}

function CohortCard({ countdown, seats }: { countdown: string | null; seats: Seats | null }) {
  return (
    <div className="relative overflow-hidden rounded-[1.25rem] border border-[color:var(--border)] bg-[#171d17] p-5 text-[#f4f2e8] shadow-[0_30px_80px_rgba(23,29,23,0.18)] sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_45%,transparent)] blur-2xl orb-one" />
      <div className="relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
          Cohorte du {formation.startLabel}
        </p>
        <p className="font-display mt-2 text-2xl font-bold text-white sm:text-3xl">
          {countdown ?? "Inscriptions ouvertes"}
        </p>
        <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
          {Object.values(formation.schedule).map((slot) => {
            const seat = seats?.[slot.id];
            const badge = seat ? seatsLabel(seat) : null;
            return (
              <li key={slot.id} className="flex items-center justify-between gap-3 py-3">
                <div className={seat?.full ? "opacity-50 line-through" : undefined}>
                  <p className="font-medium text-white">{slot.label}</p>
                  <p className="text-sm text-white/55">{slot.hours}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    badge ? "bg-[color:var(--accent-light)] text-white" : "bg-white/10 text-white/70"
                  }`}
                >
                  {badge ?? "Places disponibles"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-white/60">
          {formation.sessionsCount} séances de 4 h 30 · du {formation.startLabel} au {formation.endLabel}
        </p>
        <Link
          href="/inscription"
          className="mt-5 inline-flex font-display text-sm font-semibold text-[color:var(--accent-lightest)] hover:underline"
        >
          Choisir ma classe →
        </Link>
      </div>
    </div>
  );
}

function Projects() {
  return (
    <section className="border-b border-[color:var(--border)] bg-[color:var(--neutral-100)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">Le 20 décembre</p>
          <h2 className="font-display mt-3 max-w-3xl text-3xl tracking-tight sm:text-4xl">
            Tu auras 3 projets en ligne dans ton portfolio.
          </h2>
          <p className="mt-4 max-w-2xl text-[color:var(--neutral-600)]">
            Pas de théorie pendant des heures : à chaque séance, tu construis. Et tu repars avec de quoi montrer
            ton travail à tes premiers clients.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {formation.projects.map((project, i) => (
            <Reveal key={project.title} delay={i * 80}>
              <article className="h-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent-dark)]">
                  Projet {i + 1}
                </p>
                <h3 className="font-display mt-3 text-xl">{project.title}</h3>
                <p className="mt-2 text-[color:var(--neutral-600)]">{project.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-10 font-display text-lg">Et tu sauras :</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {formation.outcomes.map((item) => (
              <li key={item} className="flex gap-3 text-[color:var(--neutral-700)]">
                <Check />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

const audience = [
  {
    title: "Étudiant ou jeune diplômé",
    text: "Tu veux une compétence qui se vend, sans passer des années à apprendre à coder.",
  },
  {
    title: "Freelance, graphiste, community manager",
    text: "Tu veux ajouter la création de sites et d'applications à tes services.",
  },
  {
    title: "Entrepreneur",
    text: "Tu veux créer ton site ou ton outil toi-même au lieu de payer une agence.",
  },
  {
    title: "Développeur débutant",
    text: "Tu veux aller beaucoup plus vite en faisant travailler l'IA à ta place.",
  },
];

function Audience() {
  return (
    <section className="border-b border-[color:var(--border)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">Pour qui</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">C&apos;est pour toi si…</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {audience.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <div className="h-full rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,white_65%,transparent)] p-5">
                <h3 className="font-display text-lg">{item.title}</h3>
                <p className="mt-2 text-[color:var(--neutral-600)]">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-6 rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] p-5">
            <p className="font-display text-[color:var(--accent-darkest)]">Ce qu&apos;il te faut</p>
            <p className="mt-2 text-[color:var(--neutral-700)]">
              Un ordinateur portable, de la motivation et {formation.sessionsCount} demi-journées. Pas besoin de
              savoir coder : on part de zéro.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Programme() {
  return (
    <section
      id="programme"
      className="scroll-mt-24 border-b border-[color:var(--border)] bg-[color:var(--neutral-100)] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">Le programme</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            {formation.sessionsCount} séances. Une méthode, trois projets.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {formation.months.map((m, i) => (
            <Reveal key={m.month} delay={i * 90}>
              <article className="h-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent-dark)]">
                  {m.month}
                </p>
                <h3 className="font-display mt-3 text-2xl tracking-tight">{m.focus}</h3>
                <ul className="mt-5 space-y-3 text-[color:var(--neutral-600)]">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const remaining = formation.installments.length;
  return (
    <section
      id="tarifs"
      className="scroll-mt-24 border-b border-[color:var(--border)] bg-[color:var(--neutral-100)] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">Tarif</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Commence avec {formatFcfa(formation.registrationFee)}.
          </h2>
          <p className="mt-4 max-w-2xl text-[color:var(--neutral-600)]">
            La préinscription réserve ta place. Le reste se paie pendant la formation, en {remaining} fois.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] [&>*]:min-w-0">
          <Reveal>
            <div className="h-full rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
                Aujourd&apos;hui · préinscription
              </p>
              <p className="font-display mt-2 text-4xl text-[color:var(--accent-darkest)]">
                {formatFcfa(formation.registrationFee)}
              </p>
              <p className="mt-3 text-sm text-[color:var(--neutral-600)]">
                Réserve ta place dans la classe choisie et ouvre ton espace apprenant. Paiement par Mobile Money,
                non remboursable.
              </p>
              <Link href="/inscription" className="btn-primary mt-6 w-full sm:w-auto">
                Réserver ma place
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="h-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
                Ensuite, pendant la formation
              </p>
              <ul className="mt-4 space-y-3">
                {formation.installments.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-1 border-b border-[color:var(--border)] pb-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[color:var(--neutral-black)]">{item.label}</p>
                      <p className="text-sm text-[color:var(--neutral-500)]">{item.due}</p>
                    </div>
                    <p className="text-lg font-semibold">{formatFcfa(item.amount)}</p>
                  </li>
                ))}
                <li className="flex items-center justify-between pt-1">
                  <p className="font-medium text-[color:var(--neutral-black)]">Total de la formation</p>
                  <p className="text-lg font-semibold">{formatFcfa(formation.totalPrice)}</p>
                </li>
              </ul>
              <p className="mt-6 font-display text-sm">Ce qui est inclus</p>
              <ul className="mt-3 space-y-2 text-sm text-[color:var(--neutral-700)]">
                {formation.included.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const steps = [
  { title: "Crée ton compte", text: "Ton nom, ton email, un mot de passe et ta classe. Une minute suffit." },
  {
    title: `Paie ${formatFcfa(formation.registrationFee)}`,
    text: "Par Mobile Money, en quelques secondes. Ta place est réservée.",
  },
  {
    title: "Entre dans ton espace",
    text: "Tu accèdes à ton espace apprenant et au groupe WhatsApp de la cohorte.",
  },
];

function Steps() {
  return (
    <section className="border-b border-[color:var(--border)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">Inscription</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">3 étapes, 2 minutes.</h2>
        </Reveal>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 80}>
              <li className="h-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6">
                <span className="font-display flex size-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="font-display mt-4 text-xl">{step.title}</h3>
                <p className="mt-2 text-[color:var(--neutral-600)]">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <div className="mt-8">
          <Link href="/inscription" className="btn-primary w-full sm:w-auto">
            Commencer mon inscription
          </Link>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-b border-[color:var(--border)] bg-[color:var(--neutral-100)] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">FAQ</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">Tes questions avant de t&apos;inscrire.</h2>
        </Reveal>
        <div className="mt-10 divide-y divide-[color:var(--border)] border-y border-[color:var(--border)]">
          {formation.faq.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="cursor-pointer list-none font-medium text-[color:var(--neutral-black)] marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-[color:var(--accent-dark)] transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 max-w-3xl leading-relaxed text-[color:var(--neutral-600)]">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-[color:var(--neutral-600)]">
          Une autre question ?{" "}
          <WhatsAppLink className="font-semibold text-[color:var(--accent)] hover:underline">
            Écris-nous sur WhatsApp
          </WhatsAppLink>
        </p>
      </div>
    </section>
  );
}

function FinalCta({ countdown }: { countdown: string | null }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-[#171d17] px-6 py-12 text-[#fbfaf4] sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute -right-8 -top-10 size-56 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_35%,transparent)] blur-3xl orb-one" />
            <div className="relative max-w-2xl">
              <p className="section-kicker !text-[color:var(--accent-lightest)]">
                {countdown ?? `Cohorte du ${formation.startLabel}`}
              </p>
              <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
                Dans {formation.sessionsCount} séances, tu crées et tu vends avec l&apos;IA.
              </h2>
              <p className="mt-4 text-white/65">
                {formation.maxPerClass} places par classe. Réserve la tienne pour{" "}
                {formatFcfa(formation.registrationFee)} et rejoins la cohorte du {formation.startLabel}.
              </p>
              <Link
                href="/inscription"
                className="btn-primary mt-8 w-full text-sm sm:text-base !bg-[color:var(--accent-lightest)] !text-[color:var(--neutral-black)] hover:!bg-white sm:w-auto"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className="mt-0.5 size-5 shrink-0 text-[color:var(--accent)]"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
