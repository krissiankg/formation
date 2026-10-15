import { redirect } from "next/navigation";
import { brand } from "@/lib/config/formation";
import { getSessionEnrollment } from "@/lib/auth/session";
import { createStudentIaKey } from "@/lib/ia/student-key";
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

  // Clé personnelle signée pour la passerelle IA (désactivée automatiquement si l'accès est bloqué).
  const studentApiKey = createStudentIaKey(enrollment.id);

  return (
    <div className="mx-auto max-w-5xl">
      <ResourcesHubClient
        studentApiKey={studentApiKey}
        contents={contents}
      />
    </div>
  );
}
