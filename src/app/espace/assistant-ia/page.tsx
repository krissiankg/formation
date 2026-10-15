import Link from "next/link";
import { redirect } from "next/navigation";
import { getCourseAccess } from "@/lib/access/course-access";
import { getSessionEnrollment } from "@/lib/auth/session";
import { brand } from "@/lib/config/formation";
import { FCFA_PER_COIN, getIaBalance, listRecentIaUsage } from "@/lib/ia/usage-store";
import { FORGEIA_CODE_DOWNLOAD_PATH, FORGEIA_CODE_VERSION } from "@/lib/ia/extension-info";
import { createStudentIaKey } from "@/lib/ia/student-key";
import { getOrCreateStudentWallet } from "@/lib/wallet/store";
import { PageHeader } from "@/components/espace/shared";
import { AssistantIaClient } from "@/components/espace/AssistantIaClient";

export const metadata = {
  title: `Mon assistant IA — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function AssistantIaPage() {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/connexion");

  const access = getCourseAccess(enrollment);
  if (access.blocked || access.maxModuleSort < 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] px-6 py-12 text-center">
        <p className="font-display text-xl">🔒 Mon assistant IA</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--neutral-600)]">
          {access.blocked
            ? "Accès suspendu — contacte le formateur."
            : "FORGEIA CODE s'active dès que ton inscription est payée."}
        </p>
        {access.blocked ? null : (
          <Link href="/espace/paiements" className="btn-primary mt-6 inline-flex !py-2.5 text-sm">
            Voir mes paiements →
          </Link>
        )}
      </div>
    );
  }

  const [balance, recent, wallet] = await Promise.all([
    getIaBalance(enrollment),
    listRecentIaUsage(enrollment.id),
    getOrCreateStudentWallet(enrollment.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        kicker="Outils"
        title="Mon assistant IA"
        description="FORGEIA CODE : ton assistant de code dans VS Code, avec les modes de la méthode ADAPT. Ton crédit IA est inclus dans ta formation."
      />
      <AssistantIaClient
        version={FORGEIA_CODE_VERSION}
        downloadPath={FORGEIA_CODE_DOWNLOAD_PATH}
        connectUrl="/espace/assistant-ia/connect"
        apiKey={createStudentIaKey(enrollment.id)}
        balance={balance}
        walletCoins={wallet.balanceCoins}
        fcfaPerCoin={FCFA_PER_COIN}
        recent={recent}
      />
    </div>
  );
}
