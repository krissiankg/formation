import { getExamplesViewer as getResourcesViewer } from "@/lib/website-examples/access";
import { findPublishedAttachment, downloadContentFile } from "@/lib/resources/content-download";
import { contentAttachmentUnlockId, resourceFileName } from "@/lib/resources/content-attachments";
import { hasStudentUnlockedFile } from "@/lib/wallet/store";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const viewer = await getResourcesViewer();
  if (!viewer) return Response.json({ error: "Connexion requise." }, { status: 401, headers });
  const { id } = await context.params;
  try {
    const attachment = await findPublishedAttachment({ id });
    const fileName = attachment && resourceFileName(attachment.url);
    if (!attachment || !fileName) return Response.json({ error: "Ressource introuvable." }, { status: 404, headers });
    if (!viewer.isAdmin && !await hasStudentUnlockedFile(viewer.enrollmentId, contentAttachmentUnlockId(attachment))) {
      return Response.json({ error: "Débloque ce fichier avec tes coins avant de le télécharger." }, { status: 403, headers });
    }
    return await downloadContentFile(fileName, attachment);
  } catch {
    return Response.json({ error: "Téléchargement momentanément indisponible." }, { status: 503, headers });
  }
}
