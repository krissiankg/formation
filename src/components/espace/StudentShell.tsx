"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { brand, contact } from "@/lib/config/formation";

const nav = [
  { id: "overview", label: "Tableau de bord", href: "/espace" },
  { id: "programme", label: "Mon programme", href: "/espace/programme" },
  { id: "tests", label: "Tests & Quiz", href: "/espace/tests" },
  { id: "ressources", label: "Ressources & IA", href: "/espace/ressources" },
  { id: "paiements", label: "Mes paiements", href: "/espace/paiements" },
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
    phone: string;
    isPaid: boolean;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[color:var(--border)] bg-[color:var(--neutral-50)] lg:flex">
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

          <div className="border-t border-[color:var(--border)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[color:var(--accent-lightest)] text-sm font-semibold text-[color:var(--accent-darkest)]">
                {student.firstName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{student.fullName}</p>
                <p className="truncate text-xs text-[color:var(--neutral-500)]">
                  {student.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="mt-3 w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-xs text-[color:var(--neutral-600)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--neutral-black)]"
            >
              {loggingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
            <Link
              href="/"
              className="mt-2 block text-center text-xs text-[color:var(--neutral-500)] hover:text-[color:var(--accent-dark)]"
            >
              ← Retour au site
            </Link>
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
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo-color.png"
                  alt="Logo FORGEIA"
                  width={24}
                  height={24}
                  className="rounded object-contain"
                />
                <span className="font-logo text-sm font-black tracking-wider text-[color:var(--neutral-black)]">
                  FORGE<span className="text-[color:var(--accent)]">IA</span>
                </span>
              </Link>
            </div>
            <p className="hidden text-sm text-[color:var(--neutral-500)] lg:block">
              Bonjour,{" "}
              <span className="font-medium text-[color:var(--neutral-black)]">
                {student.firstName}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-3 py-1 text-xs text-[color:var(--neutral-600)] sm:inline">
                {student.scheduleLabel}
              </span>
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !px-3 !py-2 text-xs sm:text-sm"
              >
                Aide
              </a>
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
              <button
                type="button"
                onClick={logout}
                className="mt-2 w-full rounded-lg px-3 py-2.5 text-left text-sm text-[color:var(--neutral-600)]"
              >
                Se déconnecter
              </button>
            </div>
          ) : null}

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
