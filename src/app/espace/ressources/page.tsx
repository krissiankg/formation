import { redirect } from "next/navigation";
import { brand } from "@/lib/config/formation";
import { getSessionEnrollment } from "@/lib/auth/session";
import { listPublishedContent } from "@/lib/store/content";
import { ResourcesHubClient } from "@/components/espace/ResourcesHubClient";

export const metadata = {
  title: `Ressources & IA — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function RessourcesPage() {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/connexion");

  const contents = await listPublishedContent();

  // Clé étudiante déterministe
  const studentSlug = enrollment.fullName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 15);
  const studentApiKey = `forge_${studentSlug}_${enrollment.id.slice(0, 6)}`;

  return (
    <div className="mx-auto max-w-5xl">
      <ResourcesHubClient
        studentApiKey={studentApiKey}
        contents={contents}
      />
    </div>
  );
}
