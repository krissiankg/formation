"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { StudentTopbar } from "@/components/espace/StudentTopbar";
import { contact } from "@/lib/config/formation";
import type { StudentPending } from "@/lib/espace/pending";

type NavItem = { label: string; href: string; icon: string; badge?: "quizzes" | "paymentDue" };

// Menu organisé selon le parcours de l'apprenant : apprendre, utiliser ses outils, gérer son compte.
const sections: { title: string | null; items: NavItem[] }[] = [
  { title: null, items: [{ label: "Tableau de bord", href: "/espace", icon: "📊" }] },
  {
    title: "Apprendre",
    items: [
      { label: "Mon programme", href: "/espace/programme", icon: "🗓️" },
      { label: "Quiz", href: "/espace/tests", icon: "📝", badge: "quizzes" },
      { label: "Mes projets", href: "/espace/projets", icon: "🚀" },
    ],
  },
  {
    title: "Outils",
    items: [
      { label: "Ressources & IA", href: "/espace/ressources", icon: "⚡" },
      { label: "Boutique de coins", href: "/espace/coins", icon: "🪙" },
    ],
  },
  {
    title: "Mon compte",
    items: [
      { label: "Mes paiements", href: "/espace/paiements", icon: "💳", badge: "paymentDue" },
      { label: "Donner mon avis", href: "/espace/avis", icon: "⭐" },
    ],
  },
];
function isActive(pathname: string, href: string) {
  if (href === "/espace") return pathname === "/espace";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  pending,
  onNavigate,
}: {
  pathname: string;
  pending: StudentPending;
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
              const count = item.badge === "quizzes" ? pending.quizzes : 0;
              const dot = item.badge === "paymentDue" && pending.paymentDue;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[color:var(--neutral-black)] text-[color:var(--neutral-50)] shadow-xs"
                      : "text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)] hover:text-[color:var(--neutral-black)]"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {count > 0 ? (
                    <span
                      className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold ${
                        active ? "bg-[color:var(--neutral-50)] text-[color:var(--neutral-black)]" : "bg-[color:var(--accent)] text-white"
                      }`}
                      aria-label={`${count} quiz à faire`}
                    >
                      {count}
                    </span>
                  ) : null}
                  {dot ? (
                    <span className="size-2.5 rounded-full bg-[color:var(--accent)]" aria-label="Paiement à effectuer" />
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

function FooterLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-1 border-t border-[color:var(--border)] p-3">
      <a
        href={contact.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#128c4a] transition hover:bg-[#e8f8ef]"
      >
        💬 Contacter le formateur
      </a>
      <Link
        href="/"
        onClick={onNavigate}
        className="block rounded-lg px-3 py-1.5 text-xs text-[color:var(--neutral-500)] transition hover:bg-[color:var(--neutral-100)] hover:text-[color:var(--accent-dark)]"
      >
        ← Retour au site
      </Link>
    </div>
  );
}

export function StudentShell({
  children,
  student,
  pending,
}: {
  children: React.ReactNode;
  student: {
    firstName: string;
    fullName: string;
    email: string;
    scheduleLabel: string;
    phone?: string;
    isPaid?: boolean;
    avatarUrl?: string | null;
  };
  pending: StudentPending;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const hasPending = pending.quizzes > 0 || pending.paymentDue;

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/connexion");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--neutral-100)]">
      <div className="flex min-h-screen">
        {/* Barre latérale (ordinateur) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[color:var(--border)] bg-[color:var(--neutral-50)] lg:flex">
          <div className="border-b border-[color:var(--border)] px-5 py-5">
            <Link href="/espace" className="flex items-center gap-2.5 group">
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
              Espace apprenant
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <NavLinks pathname={pathname} pending={pending} />
          </nav>

          <FooterLinks />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Barre supérieure : coins, profil, déconnexion */}
          <StudentTopbar
            student={student}
            onLogout={logout}
            loggingOut={loggingOut}
            onToggleMobile={() => setMobileOpen((v) => !v)}
            mobileOpen={mobileOpen}
            menuBadge={hasPending}
          />

          {/* Menu mobile */}
          {mobileOpen && (
            <div className="border-b border-[color:var(--border)] bg-[color:var(--neutral-50)] lg:hidden animate-in slide-in-from-top-2">
              <div className="p-3">
                <NavLinks pathname={pathname} pending={pending} onNavigate={() => setMobileOpen(false)} />
              </div>
              <FooterLinks onNavigate={() => setMobileOpen(false)} />
              <div className="border-t border-[color:var(--border)] p-3">
                <button
                  type="button"
                  onClick={logout}
                  disabled={loggingOut}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-60"
                >
                  {loggingOut ? "Déconnexion…" : "🚪 Se déconnecter"}
                </button>
              </div>
            </div>
          )}

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}