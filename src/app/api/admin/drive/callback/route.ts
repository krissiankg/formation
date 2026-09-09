import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { exchangeOAuthCode } from "@/lib/drive/google-drive";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuth = await verifyAdminSessionToken(token);

  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const baseUrl = `${proto}://${host}`;
  const redirectUri = `${baseUrl}/api/admin/drive/callback`;

  if (!isAuth) {
    return NextResponse.redirect(`${baseUrl}/admin/connexion`);
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/admin/contenus?drive=error&msg=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/admin/contenus?drive=error&msg=${encodeURIComponent("Code d'autorisation manquant")}`
    );
  }

  try {
    const stored = await exchangeOAuthCode(code, redirectUri);
    console.log("[Drive OAuth] Compte lié avec succès:", stored.connectedEmail);
    return NextResponse.redirect(`${baseUrl}/admin/contenus?drive=success`);
  } catch (err) {
    console.error("[Drive OAuth] Erreur échange de code:", err);
    return NextResponse.redirect(
      `${baseUrl}/admin/contenus?drive=error&msg=${encodeURIComponent((err as Error).message)}`
    );
  }
}
