import { getExamplesCatalog, signExampleDownload } from "@/lib/website-examples/server";
import { getExamplesViewer } from "@/lib/website-examples/access";
import { exampleUnlockId } from "@/lib/website-examples/purchases";
import { hasStudentUnlockedFile } from "@/lib/wallet/store";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const viewer = await getExamplesViewer();
  if (!viewer) return Response.json({ error: "Connecte-toi à ton espace étudiant." }, { status: 401, headers });
  const { id } = await context.params;
  if (!/^[a-z0-9][a-z0-9-]{0,100}$/.test(id)) return Response.json({ error: "Exemple introuvable." }, { status: 404, headers });
  try {
    const catalog = await getExamplesCatalog();
    const entry = catalog.entries.find((item) => item.id === id);
    if (!entry) return Response.json({ error: "Exemple introuvable." }, { status: 404, headers });
    if (!viewer.isAdmin && !await hasStudentUnlockedFile(viewer.enrollmentId, exampleUnlockId(entry))) {
      return Response.json({ error: "Débloque cette archive avec tes coins avant de la télécharger." }, { status: 403, headers });
    }
    const url = await signExampleDownload(catalog, entry);
    return Response.json({ url }, { headers });
  } catch {
    return Response.json({ error: "Téléchargement indisponible pour le moment." }, { status: 503, headers });
  }
}
