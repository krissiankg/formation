import { getExamplesViewer } from "@/lib/website-examples/access";
import { getExamplesCatalog } from "@/lib/website-examples/server";
import { exampleUnlockId } from "@/lib/website-examples/purchases";
import { calculateFileCoinsCost } from "@/lib/wallet/pricing";
import { debitCoinsForFile } from "@/lib/wallet/store";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const viewer = await getExamplesViewer();
  if (!viewer) return Response.json({ error: "Connecte-toi à ton espace étudiant." }, { status: 401, headers });
  const { id } = await context.params;
  if (!/^[a-z0-9][a-z0-9-]{0,100}$/.test(id)) return Response.json({ error: "Exemple introuvable." }, { status: 404, headers });
  try {
    const catalog = await getExamplesCatalog();
    const entry = catalog.entries.find((item) => item.id === id);
    if (!entry) return Response.json({ error: "Exemple introuvable." }, { status: 404, headers });
    if (viewer.isAdmin) return Response.json({ success: true, alreadyUnlocked: true, cost: 0, newBalance: 999999 }, { headers });

    // Le poids, le nom et la clé d'achat viennent du catalogue privé, jamais du navigateur.
    const cost = calculateFileCoinsCost(entry.archiveBytes);
    const body = await request.json().catch(() => null);
    if (!body || typeof body.expectedCost !== "number" || !Number.isSafeInteger(body.expectedCost)) {
      return Response.json({ error: "Confirme le coût affiché pour débloquer cette archive." }, { status: 400, headers });
    }
    if (body.expectedCost !== cost) {
      return Response.json({ error: "Le prix de cette archive a changé. Actualise la page avant de confirmer. Aucun coin n'a été débité.", cost }, { status: 409, headers });
    }
    const result = await debitCoinsForFile(viewer.enrollmentId, exampleUnlockId(entry), `FORGEIA HTML — ${entry.title}`, cost);
    if (!result.success) return Response.json({ error: result.error || "Solde insuffisant.", balance: result.newBalance, cost }, { status: 402, headers });
    return Response.json({ ...result, cost: result.alreadyUnlocked ? 0 : cost }, { headers });
  } catch {
    return Response.json({ error: "Déblocage indisponible pour le moment. Aucun nouveau téléchargement ne sera facturé pour une archive déjà débloquée." }, { status: 503, headers });
  }
}
