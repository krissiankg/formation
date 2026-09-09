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
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAdmin = await verifyAdminSessionToken(adminToken);

  if (!student && !isAdmin) {
    return NextResponse.json({ error: "Connexion requise pour télécharger ce fichier." }, { status: 401 });
  }

  const { fileId } = await params;

  if (!fileId || typeof fileId !== "string") {
    return NextResponse.json({ error: "Identifiant de fichier invalide" }, { status: 400 });
  }

  // 2. Si l'utilisateur est un étudiant (et non l'administrateur), vérifier que le fichier est bien débloqué
  if (student && !isAdmin) {
    const { hasStudentUnlockedFile } = await import("@/lib/wallet/store");
    const isUnlocked = await hasStudentUnlockedFile(student.id, fileId);
    if (!isUnlocked) {
      return NextResponse.json(
        { error: "Fichier verrouillé. Vous devez débloquer cette ressource avec vos coins pour la télécharger." },
        { status: 403 }
      );
    }
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
