import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { legal } from "@/lib/config/legal";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

// Mise en page commune des pages légales : titre, sommaire, sections numérotées.
export function LegalPage({
  kicker,
  title,
  intro,
  sections,
  related,
}: {
  kicker: string;
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
  related: { href: string; label: string };
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="section-kicker">{kicker}</p>
        <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-[color:var(--neutral-500)]">
          Dernière mise à jour : {legal.lastUpdated}
        </p>
        <div className="mt-6 leading-relaxed text-[color:var(--neutral-600)]">{intro}</div>

        <nav
          aria-label="Sommaire"
          className="mt-10 rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6"
        >
          <p className="font-display text-sm font-semibold uppercase tracking-wide">Sommaire</p>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="accent-text hover:underline">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="legal-content mt-12 space-y-12">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-display text-xl tracking-tight sm:text-2xl">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-[color:var(--neutral-600)]">
                {s.content}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-16 border-t border-[color:var(--border)] pt-6 text-sm text-[color:var(--neutral-600)]">
          Voir aussi :{" "}
          <Link href={related.href} className="accent-text hover:underline">
            {related.label}
          </Link>
          . Une question ? Écris-nous à{" "}
          <a href={`mailto:${legal.email}`} className="accent-text hover:underline">
            {legal.email}
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
