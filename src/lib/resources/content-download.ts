import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { listPublishedContent, type ContentAttachment } from "@/lib/store/content";
import { isS3UploadEnabled, createResourceDownloadUrl } from "@/lib/storage/s3-upload";
import { resourceFileName } from "./content-attachments";

export async function findPublishedAttachment(match: { id: string } | { url: string }) {
  const contents = await listPublishedContent();
  return contents.flatMap((item) => item.attachments ?? []).find((attachment) =>
    "id" in match ? attachment.id === match.id : attachment.url === match.url,
  );
}

/** Appelé uniquement après le contrôle d'achat ou de la session administrateur. */
export async function downloadContentFile(fileName: string, attachment?: ContentAttachment): Promise<Response> {
  if (resourceFileName(`/uploads/resources/${fileName}`) !== fileName) {
    return Response.json({ error: "Fichier introuvable." }, { status: 404 });
  }
  const headers = { "Cache-Control": "private, no-store" };
  if (isS3UploadEnabled()) {
    const url = await createResourceDownloadUrl(fileName, attachment?.name ?? fileName);
    return new Response(null, { status: 302, headers: { ...headers, Location: url } });
  }
  const privatePath = path.join(process.cwd(), "data", "resources", fileName);
  const oldPath = path.join(process.cwd(), "public", "uploads", "resources", fileName);
  const localPath = fs.existsSync(privatePath) ? privatePath : oldPath;
  if (!fs.existsSync(localPath)) return Response.json({ error: "Fichier introuvable." }, { status: 404, headers });
  return new Response(Readable.toWeb(fs.createReadStream(localPath)) as ReadableStream<Uint8Array>, {
    headers: {
      ...headers,
      "Content-Type": attachment?.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(attachment?.name ?? fileName)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
