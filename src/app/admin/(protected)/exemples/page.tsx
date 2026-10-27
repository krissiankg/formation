import { ResourcesHubClient } from "@/components/espace/ResourcesHubClient";

export const metadata = { title: "Bibliothèque de ressources — FORGEIA" };

export default async function AdminExamplesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <div className="mx-auto max-w-7xl"><ResourcesHubClient contents={[]} examplesAvailable initialTab={tab} audience="admin" /></div>;
}
