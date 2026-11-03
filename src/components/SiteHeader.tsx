import Link from "next/link";
import Image from "next/image";
import { contact } from "@/lib/config/formation";

const links = [
  { href: "/#programme", label: "Programme" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--neutral-50)_86%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Hauteur fixe + retour à la ligne masqué : si le nom ne tient pas à côté des boutons
            (petit écran, texte agrandi sur Android), il passe à la ligne et disparaît en entier
            au lieu d'être recouvert par « Connexion ». */}
        <Link
          href="/"
          className="group flex h-10 min-w-0 flex-1 flex-wrap content-start items-center gap-x-2.5 overflow-hidden md:flex-none"
        >
          {/* Même hauteur que le lien : le nom renvoyé à la ligne commence pile sous la zone visible. */}
          <span className="flex h-10 shrink-0 items-center">
            <Image
              src="/logo-color.png"
              alt="Logo FORGEIA"
              width={34}
              height={34}
              className="rounded-lg object-contain transition group-hover:scale-105"
              priority
            />
          </span>
          <span className="whitespace-nowrap font-logo text-lg font-black leading-10 tracking-wider text-[color:var(--neutral-black)]">
            FORGE<span className="text-[color:var(--accent)]">IA</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 font-display text-sm font-semibold tracking-wider text-[color:var(--neutral-600)] md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[color:var(--accent)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost !hidden !px-4 !py-2.5 text-sm lg:!inline-flex"
          >
            WhatsApp
          </a>
          <Link
            href="/connexion"
            className="btn-ghost !px-2.5 sm:!px-4 !py-2 sm:!py-2.5 text-xs sm:text-sm"
          >
            Connexion
          </Link>
          <Link href="/inscription" className="btn-primary !px-3 sm:!px-4 !py-2 sm:!py-2.5 text-xs sm:text-sm">
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}
