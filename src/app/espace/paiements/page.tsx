import { redirect } from "next/navigation";
import { PageHeader } from "@/components/espace/shared";
import { PaymentsClient } from "@/components/espace/PaymentsClient";
import { getPaymentSchedule } from "@/lib/programme/payments";
import { brand } from "@/lib/config/formation";
import { getStudentContext } from "@/lib/store/student-context";

export const metadata = {
  title: `Paiements — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function PaiementsPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  const items = getPaymentSchedule(ctx.enrollment);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        kicker="Paiements"
        title="Suivi de tes échéances"
        description="Consulte ce que tu as déjà payé et règle directement tes prochaines tranches par Mobile Money."
      />
      <PaymentsClient items={items} />
    </div>
  );
}
