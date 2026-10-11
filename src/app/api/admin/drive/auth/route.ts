import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { getGoogleOAuthUrl } from "@/lib/drive/google-drive";
import { getPublicOrigin } from "@/lib/http/public-origin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuth = await verifyAdminSessionToken(token);

  if (!isAuth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const redirectUri = `${getPublicOrigin(request)}/api/admin/drive/callback`;

  try {
    const authUrl = getGoogleOAuthUrl(redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Erreur configuration Google OAuth" },
      { status: 500 }
    );
  }
}
