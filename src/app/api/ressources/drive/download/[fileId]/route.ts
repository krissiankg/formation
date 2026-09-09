import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEnrollment } from "@/lib/auth/session";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { getFileDownloadStream } from "@/lib/drive/google-drive";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  // 1. Vérification session
  const student = await getSessionEnrollment();
  let isAuthorized = Boolean(student);

  if (!isAuthorized) {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    isAuthorized = await verifyAdminSessionToken(adminToken);
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Connexion requise pour télécharger ce fichier." }, { status: 401 });
  }

  const { fileId } = await params;

  if (!fileId || typeof fileId !== "string") {
    return NextResponse.json({ error: "Identifiant de fichier invalide" }, { status: 400 });
  }

  try {
    const { stream, file, contentType, contentLength } = await getFileDownloadStream(fileId);

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    // Encodage standard RFC 5987 pour les noms de fichiers avec caractères spéciaux
    const asciiName = file.name.replace(/[^\x20-\x7E]/g, "_");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(file.name)}`
    );

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error(`[Drive Download] Erreur fichier ${fileId}:`, err);
    return NextResponse.json(
      { error: (err as Error).message || "Erreur lors du téléchargement" },
      { status: 500 }
    );
  }
}
