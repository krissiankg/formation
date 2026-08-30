import Link from "next/link";
import { brand, contact } from "@/lib/config/formation";

const links = [
  { href: "/#programme", label: "Programme" },
  { href: "/#format", label: "Format" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--neutral-50)_86%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-[color:var(--neutral-black)]"
        >
          {brand.name}
          <span className="text-[color:var(--accent)]">.</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[color:var(--neutral-600)] md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[color:var(--neutral-black)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost hidden !px-4 !py-2.5 text-sm lg:inline-flex"
          >
            WhatsApp
          </a>
          <Link
            href="/connexion"
            className="btn-ghost !px-3 !py-2.5 text-sm sm:!px-4"
          >
            Connexion
          </Link>
          <Link href="/inscription" className="btn-primary text-sm px-4 py-2.5">
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}
