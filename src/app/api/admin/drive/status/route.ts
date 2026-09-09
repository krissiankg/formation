import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import {
  GOOGLE_DRIVE_FOLDER_ID,
  getStoredToken,
  isDriveConfigured,
  listFolderFiles,
} from "@/lib/drive/google-drive";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuth = await verifyAdminSessionToken(token);

  if (!isAuth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const storedToken = getStoredToken();

  const hasCredentials = Boolean(clientId && clientSecret);
  const isConnected = isDriveConfigured();

  let fileCount = 0;
  let testError: string | null = null;

  if (isConnected) {
    try {
      const files = await listFolderFiles();
      fileCount = files.length;
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
    testError,
  });
}
