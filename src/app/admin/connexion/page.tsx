import Link from "next/link";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { brand } from "@/lib/config/formation";

export const metadata = {
  title: `Connexion admin — ${brand.name}`,
  description: `Accès sécurisé à l'administration ${brand.name}.`,
};

export default function AdminConnexionPage() {
  return (
    <div className="min-h-screen bg-[color:var(--neutral-100)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            {brand.name}
            <span className="text-[color:var(--accent)]">.</span>
          </Link>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
            Administration sécurisée
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="section-kicker">Connexion admin</p>
            <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
              Espace d&apos;administration
            </h1>
            <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
              Accès réservé aux organisateurs de {brand.name}. Gestion des inscrits,
              du programme, des séances et des ressources.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-[color:var(--neutral-600)]">
              <li>• Tableau de bord et inscriptions</li>
              <li>• Programme et séances</li>
              <li>• Publication de contenus</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 shadow-[0_20px_60px_rgba(23,29,23,0.06)] sm:p-8">
            <Suspense fallback={<p className="text-sm text-[color:var(--neutral-500)]">Chargement…</p>}>
              <AdminLoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
