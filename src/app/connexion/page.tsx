import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LoginForm } from "@/components/LoginForm";
import { brand } from "@/lib/config/formation";
import { getSessionEnrollment } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Connexion — ${brand.name}`,
  description: `Connecte-toi à ton espace apprenant ${brand.name}.`,
};

export default async function ConnexionPage() {
  const session = await getSessionEnrollment();
  if (session) redirect("/espace");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <div>
          <p className="section-kicker">Connexion</p>
          <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Accède à ton espace apprenant
          </h1>
          <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
            Connecte-toi avec l&apos;email et le mot de passe de ton compte {brand.name}.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-[color:var(--neutral-600)]">
            <li>• Programme, outils et codes</li>
            <li>• Suivi des paiements</li>
            <li>• Tests et progression</li>
          </ul>
          <p className="mt-8 text-sm text-[color:var(--neutral-600)]">
            Mot de passe perdu ou jamais créé ?{" "}
            <Link href="/mot-de-passe-oublie" className="accent-text hover:underline">
              Reçois un lien par email
            </Link>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 shadow-[0_20px_60px_rgba(23,29,23,0.06)] sm:p-8">
          <LoginForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
