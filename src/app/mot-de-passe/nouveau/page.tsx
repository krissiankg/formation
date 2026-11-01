import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { brand } from "@/lib/config/formation";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export const metadata = {
  title: `Nouveau mot de passe — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function NouveauMotDePassePage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="section-kicker">Mot de passe</p>
        <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">Choisis ton mot de passe</h1>
        <p className="mt-4 leading-relaxed text-[color:var(--neutral-600)]">
          8 caractères minimum. Tu seras connecté à ton espace juste après.
        </p>
        <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 shadow-[0_20px_60px_rgba(23,29,23,0.06)] sm:p-8">
          <NewPasswordForm token={token ?? ""} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
