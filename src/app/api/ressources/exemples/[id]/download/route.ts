import { canAccessExamples, getExamplesCatalog, signExampleDownload } from "@/lib/website-examples/server";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await canAccessExamples()) return Response.json({ error: "Connecte-toi à ton espace étudiant." }, { status: 401, headers });
  const { id } = await context.params;
  if (!/^[a-z0-9][a-z0-9-]{0,100}$/.test(id)) return Response.json({ error: "Exemple introuvable." }, { status: 404, headers });
  try {
    const catalog = await getExamplesCatalog();
    const entry = catalog.entries.find((item) => item.id === id);
    if (!entry) return Response.json({ error: "Exemple introuvable." }, { status: 404, headers });
    // Gratuit provisoirement. Le serveur choisit toujours l'objet du catalogue.
    const url = await signExampleDownload(catalog, entry);
    return Response.json({ url }, { headers });
  } catch {
    return Response.json({ error: "Téléchargement indisponible pour le moment." }, { status: 503, headers });
  }
}
