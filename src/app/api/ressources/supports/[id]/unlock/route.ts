import { getExamplesViewer as getResourcesViewer } from "@/lib/website-examples/access";
import { findPublishedAttachment } from "@/lib/resources/content-download";
import { contentAttachmentUnlockId, resourceFileName } from "@/lib/resources/content-attachments";
import { calculateFileCoinsCost } from "@/lib/wallet/pricing";
import { debitCoinsForFile } from "@/lib/wallet/store";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const viewer = await getResourcesViewer();
  if (!viewer) return Response.json({ error: "Connexion requise." }, { status: 401, headers });
  const { id } = await context.params;
  try {
    const attachment = await findPublishedAttachment({ id });
    if (!attachment || !resourceFileName(attachment.url)) return Response.json({ error: "Ressource introuvable." }, { status: 404, headers });
    if (viewer.isAdmin) return Response.json({ success: true, alreadyUnlocked: true, cost: 0, newBalance: 999999 }, { headers });
    const cost = calculateFileCoinsCost(attachment.size);
    const body = await request.json().catch(() => null);
    if (!Number.isSafeInteger(body?.expectedCost)) return Response.json({ error: "Confirme le prix affiché." }, { status: 400, headers });
    if (body.expectedCost !== cost) return Response.json({ error: "Le prix a changé. Actualise la page avant de confirmer.", cost }, { status: 409, headers });
    const result = await debitCoinsForFile(viewer.enrollmentId, contentAttachmentUnlockId(attachment), attachment.name, cost);
    if (!result.success) return Response.json({ error: result.error || "Solde insuffisant.", balance: result.newBalance, cost }, { status: 402, headers });
    return Response.json({ ...result, cost: result.alreadyUnlocked ? 0 : cost }, { headers });
  } catch {
    return Response.json({ error: "Déblocage momentanément indisponible." }, { status: 503, headers });
  }
}
