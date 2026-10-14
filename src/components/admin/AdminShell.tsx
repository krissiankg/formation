"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { brand } from "@/lib/config/formation";
import type { PendingCounts } from "@/lib/admin/pending-counts";

type NavItem = { label: string; href: string; badge?: keyof PendingCounts };

// Menu organisé par grandes tâches : suivre les apprenants, construire la formation, gérer la bibliothèque.
const sections: { title: string | null; items: NavItem[] }[] = [
  { title: null, items: [{ label: "Tableau de bord", href: "/admin" }] },
  {
    title: "Apprenants",
    items: [
      { label: "Inscrits & paiements", href: "/admin/inscrits" },
      { label: "Projets à évaluer", href: "/admin/projets", badge: "projects" },
      { label: "Avis à modérer", href: "/admin/avis", badge: "testimonials" },
    ],
  },
  {
    title: "Formation",
    items: [
      { label: "Programme & leçons", href: "/admin/programme" },
      { label: "Quiz", href: "/admin/tests" },
      { label: "Calendrier des séances", href: "/admin/seances" },
      { label: "Liste de préparation", href: "/admin/todos" },
    ],
  },
  {
    title: "Ressources",
    items: [{ label: "Bibliothèque & fichiers", href: "/admin/contenus" }],
  },
];

const externalLinks = [
  { label: "Voir l'espace apprenant", href: "/espace", external: false },
  { label: "Base de données (Supabase)", href: "https://supabase.com/dashboard/project/xnoaghfvrccbihksttfe", external: true },
  { label: "WhatsApp (Evolution)", href: "https://evolution.guelichweb.store/manager", external: true },
  { label: "Site public", href: "/", external: false },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  pending,
  onNavigate,
}: {
  pathname: string;
  pending: PendingCounts;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.title ?? "home"}>
          {section.title ? (
            <p className="mb-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
              {section.title}
            </p>
          ) : null}
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              const count = item.badge ? pending[item.badge] : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-[color:var(--neutral-black)] text-[color:var(--neutral-50)]"
                      : "text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)] hover:text-[color:var(--neutral-black)]"
                  }`}
                >
                  <span>{item.label}</span>
                  {count > 0 ? (
                    <span
                      className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold ${
                        active ? "bg-[color:var(--neutral-50)] text-[color:var(--neutral-black)]" : "bg-[color:var(--accent)] text-white"
                      }`}
                      aria-label={`${count} en attente`}
                    >
                      {count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function FooterLinks({ onLogout, loggingOut }: { onLogout: () => void; loggingOut: boolean }) {
  return (
    <div className="space-y-1 border-t border-[color:var(--border)] p-3">
      {externalLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="block rounded-lg px-3 py-1.5 text-xs text-[color:var(--neutral-600)] transition hover:bg-[color:var(--neutral-100)] hover:text-[color:var(--neutral-black)]"
        >
          {link.label} ↗
        </a>
      ))}
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        className="mt-1 w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-center text-xs text-[color:var(--neutral-600)] transition hover:border-[color:var(--error)] hover:text-[color:var(--error)] disabled:opacity-60"
      >
        {loggingOut ? "Déconnexion…" : "Se déconnecter"}
      </button>
    </div>
  );
}

export function AdminShell({ children, pending }: { children: React.ReactNode; pending: PendingCounts }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const totalPending = pending.projects + pending.testimonials;

  async function onLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/connexion");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--neutral-100)]">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[color:var(--border)] bg-[color:var(--neutral-50)] lg:flex">
          <div className="border-b border-[color:var(--border)] px-5 py-5">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <Image
                src="/logo-color.png"
                alt="Logo FORGEIA"
                width={30}
                height={30}
                className="rounded-lg object-contain transition group-hover:scale-105"
              />
              <span className="font-logo text-base font-black tracking-wider text-[color:var(--neutral-black)]">
                FORGE<span className="text-[color:var(--accent)]">IA</span>
              </span>
            </Link>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
              Administration
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <NavLinks pathname={pathname} pending={pending} />
          </nav>

          <FooterLinks onLogout={onLogout} loggingOut={loggingOut} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--neutral-50)_90%,transparent)] px-4 backdrop-blur-xl sm:px-6 lg:h-16">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="relative rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm"
                aria-label="Menu"
                aria-expanded={open}
              >
                {open ? "Fermer" : "Menu"}
                {totalPending > 0 && !open ? (
                  <span className="absolute -right-1.5 -top-1.5 size-4 rounded-full bg-[color:var(--accent)] text-[10px] font-semibold leading-4 text-white">
                    {totalPending}
                  </span>
                ) : null}
              </button>
              <span className="font-display font-semibold">Admin</span>
            </div>
            <p className="hidden text-sm text-[color:var(--neutral-500)] lg:block">
              Cohorte <span className="font-medium text-[color:var(--neutral-black)]">FORGE IA</span> · {brand.tagline}
            </p>
            {totalPending > 0 ? (
              <p className="hidden text-xs text-[color:var(--neutral-500)] lg:block">
                <span className="font-semibold text-[color:var(--accent-dark)]">{totalPending}</span> élément
                {totalPending > 1 ? "s" : ""} en attente
              </p>
            ) : null}
          </header>

          {open ? (
            <div className="border-b border-[color:var(--border)] bg-[color:var(--neutral-50)] lg:hidden">
              <div className="p-3">
                <NavLinks pathname={pathname} pending={pending} onNavigate={() => setOpen(false)} />
              </div>
              <FooterLinks onLogout={onLogout} loggingOut={loggingOut} />
            </div>
          ) : null}

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
