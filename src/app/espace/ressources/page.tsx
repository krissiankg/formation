import { redirect } from "next/navigation";
import { brand } from "@/lib/config/formation";
import { getSessionEnrollment } from "@/lib/auth/session";
import { listPublishedContent } from "@/lib/store/content";
import { ResourcesHubClient } from "@/components/espace/ResourcesHubClient";
import { getExamplesCatalog } from "@/lib/website-examples/server";
import { studentContent } from "@/lib/resources/content-attachments";

export const metadata = {
  title: `Bibliothèque de ressources — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function RessourcesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/connexion");

  const contents = await listPublishedContent();
  const { tab } = await searchParams;
  let examplesAvailable = false;
  if (process.env.WEBSITE_EXAMPLES_PREVIEW_BASE_URL) {
    try { examplesAvailable = (await getExamplesCatalog()).total > 0; } catch { /* Publication not yet complete. */ }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <ResourcesHubClient
        contents={studentContent(contents)}
        examplesAvailable={examplesAvailable}
        initialTab={tab}
      />
    </div>
  );
}
