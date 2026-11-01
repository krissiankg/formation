import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { getWhatsAppGroupUrl, isWhatsAppGroupUrl, setWhatsAppGroupUrl } from "@/lib/settings/whatsapp-group";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return NextResponse.json({ url: await getWhatsAppGroupUrl() });
}

/** Enregistre (ou efface avec une valeur vide) le lien du groupe WhatsApp. */
export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { url?: unknown };
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (url && !isWhatsAppGroupUrl(url)) {
    return NextResponse.json({ error: "Lien de groupe WhatsApp invalide." }, { status: 400 });
  }

  await setWhatsAppGroupUrl(url || null);
  return NextResponse.json({ url: url || null });
}
