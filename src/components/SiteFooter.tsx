import Link from "next/link";
import { brand, contact, formation } from "@/lib/config/formation";

// Bandeau défilant : rien de daté ici, les dates et la classe viennent de la configuration.
const marqueeItems = [
  "Sites web",
  "Applications",
  "Sans savoir coder",
  "Paiement Mobile Money",
  "Présentiel à Godomey",
  `Dès le ${formation.startLabel}`,
  `${formation.maxPerClass} places`,
  "3 projets en ligne",
];

const navLinks = [
  { href: "/#programme", label: "Programme" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
  { href: "/inscription", label: "Inscription" },
  { href: "/connexion", label: "Connexion" },
];

const legalLinks = [
  { href: "/condition", label: "Conditions" },
  { href: "/politique", label: "Confidentialité" },
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
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-24 pt-10 text-sm text-white/55 sm:px-6">
        <nav
          aria-label="Pied de page"
          className="flex flex-wrap gap-x-6 gap-y-3 font-display text-sm font-medium tracking-wide text-white/75"
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
          <a
            href={contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            WhatsApp
          </a>
        </nav>
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}. {formation.location}.
          </p>
          <div className="flex flex-wrap gap-5">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
