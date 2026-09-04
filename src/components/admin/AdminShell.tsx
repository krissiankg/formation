"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { brand } from "@/lib/config/formation";

const nav = [
  { id: "overview", label: "Tableau de bord", href: "/admin" },
  { id: "inscrits", label: "Inscrits", href: "/admin/inscrits" },
  { id: "programme", label: "Programme", href: "/admin/programme" },
  { id: "tests", label: "Tests & Quiz", href: "/admin/tests" },
  { id: "seances", label: "Séances", href: "/admin/seances" },
  { id: "contenus", label: "Ressources", href: "/admin/contenus" },
  { id: "todos", label: "À faire", href: "/admin/todos" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
            <Link href="/" className="font-display text-lg font-semibold tracking-tight">
              {brand.name}
              <span className="text-[color:var(--accent)]">.</span>
            </Link>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
              Administration
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-3">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-[color:var(--neutral-black)] text-[color:var(--neutral-50)]"
                      : "text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)] hover:text-[color:var(--neutral-black)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-[color:var(--border)] p-4">
            <a
              href="https://supabase.guelichweb.store/login/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-[color:var(--border)] px-3 py-2 text-center text-xs text-[color:var(--neutral-600)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--neutral-black)]"
            >
              Supabase Studio ↗
            </a>
            <a
              href="https://evolution.guelichweb.store/manager"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-[color:var(--border)] px-3 py-2 text-center text-xs text-[color:var(--neutral-600)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--neutral-black)]"
            >
              WhatsApp (Evolution) ↗
            </a>
            <Link
              href="/"
              className="block text-center text-xs text-[color:var(--neutral-500)] hover:text-[color:var(--accent-dark)]"
            >
              ← Retour au site public
            </Link>
            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-center text-xs text-[color:var(--neutral-600)] transition hover:border-[color:var(--error)] hover:text-[color:var(--error)] disabled:opacity-60"
            >
              {loggingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--neutral-50)_90%,transparent)] px-4 backdrop-blur-xl sm:px-6 lg:h-16">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm"
                aria-label="Menu"
              >
                Menu
              </button>
              <span className="font-display font-semibold">Admin</span>
            </div>
            <p className="hidden text-sm text-[color:var(--neutral-500)] lg:block">
              Cohorte <span className="font-medium text-[color:var(--neutral-black)]">FORGE IA</span>{" "}
              · {brand.tagline}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLogout}
                disabled={loggingOut}
                className="btn-ghost !px-3 !py-2 text-xs sm:text-sm"
              >
                {loggingOut ? "Déconnexion…" : "Déconnexion"}
              </button>
              <Link href="/espace" className="btn-ghost !px-3 !py-2 text-xs sm:text-sm">
                Voir espace apprenant
              </Link>
            </div>
          </header>

          {open ? (
            <div className="border-b border-[color:var(--border)] bg-[color:var(--neutral-50)] p-3 lg:hidden">
              {nav.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm ${
                    isActive(pathname, item.href)
                      ? "bg-[color:var(--neutral-black)] text-[color:var(--neutral-50)]"
                      : "text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-100)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
