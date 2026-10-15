import { brand, formation } from "@/lib/config/formation";
import { USD_TO_FCFA } from "@/lib/ia/pricing";
import { listIaUsageByStudent } from "@/lib/ia/usage-store";
import { listEnrollments } from "@/lib/store/enrollments";
import { IaUsagePanel, type IaStudentRow } from "@/components/admin/IaUsagePanel";

export const metadata = {
  title: `Assistant IA — Admin ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function AdminIaPage() {
  const [enrollments, usage] = await Promise.all([listEnrollments(), listIaUsageByStudent()]);
  const byId = new Map(usage.map((u) => [u.enrollmentId, u]));

  const rows: IaStudentRow[] = enrollments.map((e) => {
    const u = byId.get(e.id);
    const budget = e.iaBudgetFcfa ?? formation.iaBudgetFcfa;
    const spent = u?.spentFcfa ?? 0;
    return {
      id: e.id,
      name: e.fullName,
      customBudget: e.iaBudgetFcfa ?? null,
      budgetFcfa: budget,
      spentFcfa: spent,
      consumedFcfa: u?.consumedFcfa ?? 0,
      remainingFcfa: Math.round((budget - spent) * 100) / 100,
      calls: u?.calls ?? 0,
      lastAt: u?.lastAt ?? null,
    };
  });

  return <IaUsagePanel rows={rows} defaultBudget={formation.iaBudgetFcfa} usdToFcfa={USD_TO_FCFA} />;
}
