import Link from "next/link";
import { brand, formation } from "@/lib/config/formation";

const marqueeItems = [
  "SaaS",
  "Applications",
  "Sites web",
  "Mobile Money",
  "Présentiel",
  "Oct → Déc 2026",
  "Samedi ou Dimanche",
  "Outils & codes",
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--border)] bg-[#171d17] text-[#f4f2e8]">
      <div className="overflow-hidden border-b border-white/10 py-4">
        <div className="marquee-track gap-10 px-4 font-display text-xs font-medium uppercase tracking-[0.22em] text-white">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center gap-10">
              {item}
              <span className="text-white/40">/</span>
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {brand.name}. {formation.location}.
        </p>
        <div className="flex flex-wrap gap-5 font-display text-sm font-medium tracking-wide">
          <Link href="/connexion" className="hover:text-white transition-colors">
            Connexion
          </Link>
          <Link href="/inscription" className="hover:text-white transition-colors">
            Inscription
          </Link>
          <Link href="/espace" className="hover:text-white transition-colors">
            Espace apprenant
          </Link>
          <Link href="/admin" className="hover:text-white transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
