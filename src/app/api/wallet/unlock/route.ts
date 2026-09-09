import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEnrollment } from "@/lib/auth/session";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { debitCoinsForFile } from "@/lib/wallet/store";
import { calculateFileCoinsCost } from "@/lib/wallet/pricing";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const student = await getSessionEnrollment();

  // Si c'est l'administrateur, aucun coin n'est nécessaire
  if (!student) {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const isAdmin = await verifyAdminSessionToken(adminToken);
    if (isAdmin) {
      return NextResponse.json({
        success: true,
        newBalance: 999999,
        cost: 0,
        alreadyUnlocked: true,
      });
    }
    return NextResponse.json({ error: "Connexion requise pour débloquer des ressources." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fileId = String(body.fileId ?? "").trim();
    const fileName = String(body.fileName ?? "").trim();
    const size = body.size;

    if (!fileId || !fileName) {
      return NextResponse.json({ error: "Paramètres de fichier invalides" }, { status: 400 });
    }

    const coinsCost = calculateFileCoinsCost(size);
    const result = await debitCoinsForFile(student.id, fileId, fileName, coinsCost);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Solde insuffisant", balance: result.newBalance, cost: coinsCost },
        { status: 402 } // Payment Required
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      cost: coinsCost,
      alreadyUnlocked: result.alreadyUnlocked,
    });
  } catch (err) {
    console.error("[Wallet Unlock Error]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Erreur lors du déblocage du fichier" },
      { status: 500 }
    );
  }
}
