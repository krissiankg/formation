import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEnrollment } from "@/lib/auth/session";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { searchDriveFiles, isDriveConfigured } from "@/lib/drive/google-drive";

export const dynamic = "force-dynamic";

function formatBytes(bytes?: string | number): string {
  if (!bytes) return "—";
  const num = typeof bytes === "string" ? Number.parseInt(bytes, 10) : bytes;
  if (Number.isNaN(num) || num <= 0) return "—";

  const units = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  const formatted = (num / Math.pow(1024, i)).toFixed(1);
  return `${formatted} ${units[i] ?? "o"}`;
}

export async function GET(request: Request) {
  // 1. Vérifier l'authentification (Étudiant inscrit OU Admin)
  const student = await getSessionEnrollment();
  let isAuthorized = Boolean(student);

  if (!isAuthorized) {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    isAuthorized = await verifyAdminSessionToken(adminToken);
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Connexion requise pour accéder aux ressources" }, { status: 401 });
  }

  // 2. Vérifier si Google Drive est configuré
  if (!isDriveConfigured()) {
    return NextResponse.json({
      configured: false,
      files: [],
      message: "Passerelle Google Drive non configurée ou en attente d'autorisation administrateur.",
    });
  }

  const url = new URL(request.url);
  const searchQuery = (url.searchParams.get("q") ?? "").trim();

  try {
    const rawFiles = await searchDriveFiles({
      query: searchQuery,
      pageSize: searchQuery ? 60 : 30,
    });

    const files = rawFiles.map((file) => {
      const isZip =
        file.name.toLowerCase().endsWith(".zip") ||
        file.name.toLowerCase().endsWith(".tar.gz") ||
        file.name.toLowerCase().endsWith(".rar") ||
        file.name.toLowerCase().endsWith(".7z") ||
        file.mimeType.includes("zip");

      return {
        id: file.id,
        name: file.name,
        size: file.size ? Number.parseInt(file.size, 10) : undefined,
        formattedSize: formatBytes(file.size),
        modifiedTime: file.modifiedTime,
        isZip,
      };
    });

    return NextResponse.json({
      configured: true,
      files,
      totalCount: files.length,
      query: searchQuery,
    });
  } catch (err) {
    console.error("[Drive API] Erreur récupération fichiers:", err);
    return NextResponse.json(
      {
        configured: true,
        files: [],
        error: (err as Error).message || "Erreur lors de la communication avec Google Drive",
      },
      { status: 500 }
    );
  }
}
