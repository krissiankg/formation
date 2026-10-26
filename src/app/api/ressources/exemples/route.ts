import { canAccessExamples, getExamplesCatalog } from "@/lib/website-examples/server";
import { publicCatalog } from "@/lib/website-examples/types";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  if (!await canAccessExamples()) return Response.json({ error: "Connecte-toi à ton espace étudiant." }, { status: 401, headers });
  try {
    const catalog = await getExamplesCatalog();
    return Response.json({ entries: publicCatalog(catalog, process.env.WEBSITE_EXAMPLES_PREVIEW_BASE_URL || ""), sites: catalog.sites, total: catalog.total }, { headers });
  } catch {
    return Response.json({ error: "Le catalogue est momentanément indisponible. Réessaie dans quelques instants." }, { status: 503, headers });
  }
}
