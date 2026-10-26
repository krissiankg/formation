import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import {
  GOOGLE_DRIVE_FOLDER_ID,
  getStoredToken,
  isDriveConfigured,
  countDriveFiles,
} from "@/lib/drive/google-drive";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuth = await verifyAdminSessionToken(token);

  if (!isAuth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const storedToken = await getStoredToken();

  const hasCredentials = Boolean(clientId && clientSecret);
  const isConnected = await isDriveConfigured();

  let fileCount: number | null = null;
  let fileCountIsExact = false;
  let isCounting = false;
  let testError: string | null = null;

  if (isConnected) {
    try {
      const forceRefresh = new URL(request.url).searchParams.get("refresh") === "1";
      const result = await countDriveFiles(forceRefresh);
      fileCount = result.count;
      fileCountIsExact = result.isComplete && !result.incompleteSearch;
      isCounting = !result.isComplete;
      if (result.incompleteSearch) {
        testError = "Google Drive signale une recherche partielle. Le nombre affiché est un minimum.";
      }
    } catch (err) {
      testError = (err as Error).message;
    }
  }

  return NextResponse.json({
    hasCredentials,
    isConnected,
    folderId: GOOGLE_DRIVE_FOLDER_ID,
    connectedEmail: storedToken?.connectedEmail ?? null,
    fileCount,
    fileCountIsExact,
    isCounting,
    testError,
  });
}
