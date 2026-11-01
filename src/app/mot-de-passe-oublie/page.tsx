import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { brand } from "@/lib/config/formation";

export const metadata = {
  title: `Mot de passe oublié — ${brand.name}`,
};

export default function MotDePasseOubliePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="section-kicker">Mot de passe</p>
        <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">Crée ou retrouve ton mot de passe</h1>
        <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
          Saisis l&apos;email de ton compte : tu reçois un lien pour choisir ton mot de passe. C&apos;est aussi le chemin
          à suivre si tu t&apos;es inscrit avant la mise à jour et n&apos;as encore jamais créé de mot de passe.
        </p>
        <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 shadow-[0_20px_60px_rgba(23,29,23,0.06)] sm:p-8">
          <ForgotPasswordForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
