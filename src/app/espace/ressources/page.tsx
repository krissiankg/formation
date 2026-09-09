import { redirect } from "next/navigation";
import { brand } from "@/lib/config/formation";
import { getStudentContext } from "@/lib/store/student-context";
import { ResourcesHubClient } from "@/components/espace/ResourcesHubClient";

export const metadata = {
  title: `Ressources & IA — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function RessourcesPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  // Clé étudiante déterministe
  const studentSlug = ctx.enrollment.fullName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 15);
  const studentApiKey = `forge_${studentSlug}_${ctx.enrollment.id.slice(0, 6)}`;

  return (
    <div className="mx-auto max-w-5xl">
      <ResourcesHubClient
        studentApiKey={studentApiKey}
        contents={ctx.contents}
      />
    </div>
  );
}
