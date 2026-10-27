import { getExamplesViewer as getResourcesViewer } from "@/lib/website-examples/access";
import { findPublishedAttachment, downloadContentFile } from "@/lib/resources/content-download";
import { contentAttachmentUnlockId, resourceFileName } from "@/lib/resources/content-attachments";
import { hasStudentUnlockedFile } from "@/lib/wallet/store";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

/** Les anciens liens /uploads/resources passent eux aussi par le contrôle des coins. */
export async function GET(_request: Request, context: { params: Promise<{ fileName: string }> }) {
  const viewer = await getResourcesViewer(_request);
  if (!viewer) return Response.json({ error: "Connexion requise." }, { status: 401, headers });
  const { fileName } = await context.params;
  const url = `/uploads/resources/${fileName}`;
  if (!resourceFileName(url)) return Response.json({ error: "Fichier introuvable." }, { status: 404, headers });
  try {
    if (viewer.isAdmin) return await downloadContentFile(fileName);
    const attachment = await findPublishedAttachment({ url });
    if (!attachment || !await hasStudentUnlockedFile(viewer.enrollmentId, contentAttachmentUnlockId(attachment))) {
      return Response.json({ error: "Débloque ce fichier avec tes coins avant de le télécharger." }, { status: 403, headers });
    }
    return await downloadContentFile(fileName, attachment);
  } catch {
    return Response.json({ error: "Téléchargement momentanément indisponible." }, { status: 503, headers });
  }
}
