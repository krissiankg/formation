import Link from "next/link";
import { BootLoader } from "@/components/BootLoader";
import { HeroTerminal } from "@/components/HeroTerminal";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { brand, formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";

export default function HomePage() {
  return (
    <BootLoader>
      <SiteHeader />
      <main>
        <Hero />
        <ProofStrip />
        <Outcomes />
        <Programme />
        <Format />
        <Pricing />
        <Platform />
        <TestimonialsSection />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </BootLoader>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--border)]">
      <div className="scan-line opacity-20" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-28 lg:pt-24">
        <div className="fade-up max-w-2xl">
          <p className="section-kicker mb-5">Programme de formation d&apos;élite</p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[color:var(--neutral-black)] sm:text-5xl lg:text-6xl">
            Créez.{" "}
            <span className="text-[color:var(--accent)]">Vendez.</span>
            <span className="block">Dominez avec l&apos;IA.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[color:var(--neutral-600)]">
            {brand.shortDescription} Formation présentielle ·{" "}
            {formation.startLabel} → {formation.endLabel} · samedi ou dimanche,
            9h–14h.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/inscription" className="btn-primary">
              Réserver ma place — {formatFcfa(formation.registrationFee)}
            </Link>
            <a href="#programme" className="btn-ghost">
              Voir le programme
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--neutral-500)]">
            <span>Orienté résultats</span>
            <span className="text-[color:var(--border-dark)]">·</span>
            <span>Compétences durables</span>
            <span className="text-[color:var(--border-dark)]">·</span>
            <span>Création concrète</span>
          </div>
        </div>
        <div className="fade-up" style={{ animationDelay: "120ms" }}>
          <HeroTerminal />
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--neutral-500)]">
            Pour · Entrepreneurs · Créateurs · Équipes produit
          </p>
        </div>
      </div>
    </section>
  );
}

function ProofStrip() {
  return (
    <section className="border-b border-[color:var(--border)] bg-[color:var(--neutral-100)] py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">00 — Preuve de session</p>
          <h2 className="font-display mt-3 max-w-3xl text-3xl tracking-tight text-[color:var(--neutral-black)] sm:text-4xl">
            Une formation déjà structurée pour des résultats concrets.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Durée", value: "3 mois" },
            { label: "Créneaux", value: "Sam ou Dim · 9h–14h" },
            { label: "Total", value: formatFcfa(formation.totalPrice) },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 80}>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--neutral-black)]">
                  {item.value}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Outcomes() {
  return (
    <section className="border-b border-[color:var(--border)] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">01 — Le système Forge</p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl">
            Capacités conçues pour fonctionner ensemble.
          </h2>
          <p className="mt-4 max-w-2xl text-[color:var(--neutral-600)]">
            Pas des modules isolés. Un système connecté — de l&apos;idée au produit
            vendable.
          </p>
        </Reveal>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {formation.outcomes.map((item, i) => (
            <Reveal key={item} delay={i * 70}>
              <li className="border border-[color:var(--border)] bg-[color:color-mix(in_srgb,white_65%,transparent)] px-5 py-5 transition duration-300 hover:border-[color:var(--accent)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent-dark)]">
                  0{i + 1}
                </p>
                <p className="mt-2 text-lg font-medium text-[color:var(--neutral-black)]">
                  {item}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Programme() {
  return (
    <section
      id="programme"
      className="scroll-mt-24 border-b border-[color:var(--border)] bg-[color:var(--neutral-100)] py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">02 — Parcours mis en avant</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Trois mois. Une trajectoire claire.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {formation.months.map((m, i) => (
            <Reveal key={m.month} delay={i * 90}>
              <article className="h-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent-dark)]">
                  {m.month}
                </p>
                <h3 className="font-display mt-3 text-2xl tracking-tight">
                  {m.focus}
                </h3>
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

function Format() {
  return (
    <section
      id="format"
      className="scroll-mt-24 border-b border-[color:var(--border)] py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="section-kicker">03 — Déroulement</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Présentiel. Intense. Connecté.
          </h2>
          <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
            Tu choisis un créneau unique. Sur place on construit. Sur la
            plateforme tu récupères outils, prompts, codes et tests — publiés
            progressivement, avec notif WhatsApp.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.values(formation.schedule).map((slot, i) => (
            <Reveal key={slot.id} delay={i * 80}>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
                  0{i + 1} · Créneau
                </p>
                <p className="font-display mt-2 text-xl">{slot.label}</p>
                <p className="mt-1 text-[color:var(--accent-dark)]">{slot.hours}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section
      id="tarifs"
      className="scroll-mt-24 border-b border-[color:var(--border)] bg-[color:var(--neutral-100)] py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">04 — Investissement</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            {formatFcfa(formation.totalPrice)} pour 3 mois.
          </h2>
          <p className="mt-4 max-w-2xl text-[color:var(--neutral-600)]">
            Tu démarres avec {formatFcfa(formation.registrationFee)} pour
            réserver ta place. Le reste est étalé pour suivre la formation
            sereinement.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
                Frais d&apos;inscription
              </p>
              <p className="font-display mt-2 text-4xl text-[color:var(--accent-darkest)]">
                {formatFcfa(formation.registrationFee)}
              </p>
              <p className="mt-3 text-sm text-[color:var(--neutral-600)]">
                Payés lors du formulaire. Paiement sécurisé par Mobile Money.
              </p>
              <Link href="/inscription" className="btn-primary mt-6 w-full sm:w-auto">
                S&apos;inscrire maintenant
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
                Échéancier de formation
              </p>
              <ul className="mt-5 space-y-4">
                {formation.installments.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-1 border-b border-[color:var(--border)] pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[color:var(--neutral-black)]">
                        {item.label}
                      </p>
                      <p className="text-sm text-[color:var(--neutral-500)]">
                        {item.due}
                      </p>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatFcfa(item.amount)}
                    </p>
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

function Platform() {
  return (
    <section className="border-b border-[color:var(--border)] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">05 — Espace apprenant</p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl">
            L&apos;outil central de ta formation.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Programme & séances",
              text: "Suis le fil des samedis ou dimanches, séance après séance.",
            },
            {
              title: "Outils & codes",
              text: "Prompts, extraits de code et ressources publiés progressivement — notifiés sur WhatsApp.",
            },
            {
              title: "Tests & progression",
              text: "Valide ce que tu as compris avant de passer à la suite.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="h-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 transition duration-300 hover:border-[color:var(--accent)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent-dark)]">
                  0{i + 1}
                </p>
                <h3 className="font-display mt-3 text-xl">{item.title}</h3>
                <p className="mt-2 text-[color:var(--neutral-600)]">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-b border-[color:var(--border)] bg-[color:var(--neutral-100)] py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">07 — FAQ</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Les questions à se poser avant de s&apos;inscrire.
          </h2>
        </Reveal>
        <div className="mt-10 divide-y divide-[color:var(--border)] border-y border-[color:var(--border)]">
          {formation.faq.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="cursor-pointer list-none font-medium text-[color:var(--neutral-black)] marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-[color:var(--accent-dark)] transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 max-w-3xl leading-relaxed text-[color:var(--neutral-600)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-[#171d17] px-6 py-14 text-[#fbfaf4] sm:px-12">
            <div className="pointer-events-none absolute -right-8 -top-10 size-56 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_35%,transparent)] blur-3xl orb-one" />
            <div className="relative max-w-2xl">
              <p className="section-kicker !text-[color:var(--accent)]">
                Prêt à construire
              </p>
              <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
                PRÊT À{" "}
                <span className="text-[color:var(--accent-light)]">CRÉER</span>{" "}
                PLUS INTELLIGEMMENT ?
              </h2>
              <p className="mt-4 text-white/65">
                Remplis le formulaire, choisis ton créneau, paie{" "}
                {formatFcfa(formation.registrationFee)} — et rejoins la cohorte
                d&apos;octobre 2026.
              </p>
              <Link
                href="/inscription"
                className="btn-primary mt-8 !bg-[color:var(--accent)] !text-[color:var(--neutral-black)] hover:!bg-[color:var(--accent-light)]"
              >
                Commencer mon inscription
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

