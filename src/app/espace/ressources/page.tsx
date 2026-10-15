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

  return (
    <div className="mx-auto max-w-5xl">
      <ResourcesHubClient
        contents={contents}
      />
    </div>
  );
}
