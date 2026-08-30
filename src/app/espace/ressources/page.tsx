import { redirect } from "next/navigation";
import { PageHeader, ResourcesPanel } from "@/components/espace/shared";
import { brand } from "@/lib/config/formation";
import { getStudentContext } from "@/lib/store/student-context";

export const metadata = {
  title: `Ressources — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function RessourcesPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        kicker="Ressources"
        title="Outils & codes"
        description="Tout ce que le formateur publie pour ta formation apparaît ici. Tu seras aussi notifié sur WhatsApp."
      />
      <ResourcesPanel contents={ctx.contents} />
    </div>
  );
}
