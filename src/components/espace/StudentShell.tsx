"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { StudentTopbar } from "@/components/espace/StudentTopbar";

const nav = [
  { id: "overview", label: "Tableau de bord", href: "/espace", icon: "📊" },
  { id: "programme", label: "Mon programme", href: "/espace/programme", icon: "🗓️" },
  { id: "tests", label: "Tests & Quiz", href: "/espace/tests", icon: "📝" },
  { id: "projects", label: "Projets SaaS", href: "/espace/projets", icon: "🚀" },
  { id: "ressources", label: "Ressources & IA", href: "/espace/ressources", icon: "⚡" },
  { id: "avis", label: "Mon avis", href: "/espace/avis", icon: "⭐" },
  { id: "paiements", label: "Mes paiements", href: "/espace/paiements", icon: "💳" },
];

function isActive(pathname: string, href: string) {
  if (href === "/espace") return pathname === "/espace";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentShell({
  children,
  student,
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
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
        {/* Barre latérale Bureau (Sidebar) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[color:var(--border)] bg-[color:var(--neutral-50)] lg:flex">
          {/* Logo & Titre */}
          <div className="border-b border-[color:var(--border)] px-5 py-5">
            <Link href="/" className="flex items-center gap-2.5 group">
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

          {/* Navigation unique et sans duplication */}
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[color:var(--neutral-black)] text-[color:var(--neutral-50)] shadow-xs"
                      : "text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)] hover:text-[color:var(--neutral-black)]"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Pied de sidebar moderne et minimaliste */}
          <div className="border-t border-[color:var(--border)] p-4 text-xs text-[color:var(--neutral-500)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--neutral-400)]">
                FORGE IA v1.0
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connecté
              </span>
            </div>
            <Link
              href="/"
              className="mt-3 block text-[11px] text-[color:var(--neutral-500)] hover:text-[color:var(--accent-dark)] transition"
            >
              ← Retour au site vitrine
            </Link>
          </div>
        </aside>

        {/* Contenu principal & Topbar */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Barre supérieure permanente avec Coins en direct et profil haut-de-gamme */}
          <StudentTopbar
            student={student}
            onLogout={logout}
            loggingOut={loggingOut}
            onToggleMobile={() => setMobileOpen((v) => !v)}
            mobileOpen={mobileOpen}
          />

          {/* Drawer mobile */}
          {mobileOpen && (
            <div className="border-b border-[color:var(--border)] bg-[color:var(--neutral-50)] p-3 lg:hidden space-y-1 animate-in slide-in-from-top-2">
              {nav.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive(pathname, item.href)
                      ? "bg-[color:var(--neutral-black)] text-[color:var(--neutral-50)]"
                      : "text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-100)]"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="pt-2 border-t border-[color:var(--border)]">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-left rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  🚪 Se déconnecter
                </button>
              </div>
            </div>
          )}

          {/* Corps de page */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
