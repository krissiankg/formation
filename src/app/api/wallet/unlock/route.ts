import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEnrollment } from "@/lib/auth/session";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { debitCoinsForFile } from "@/lib/wallet/store";
import { calculateFileCoinsCost } from "@/lib/wallet/pricing";
import { getFileDownloadMetadata } from "@/lib/drive/google-drive";

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

    // Les droits HTML sont réservés à leur route, qui vérifie le prix côté serveur.
    if (!/^[a-zA-Z0-9_-]{1,200}$/.test(fileId)) {
      return NextResponse.json({ error: "Paramètres de fichier invalides" }, { status: 400 });
    }

    const file = await getFileDownloadMetadata(fileId);
    const coinsCost = calculateFileCoinsCost(file.size);
    if (!Number.isSafeInteger(body.expectedCost)) {
      return NextResponse.json({ error: "Confirme le coût affiché pour débloquer ce fichier." }, { status: 400 });
    }
    if (body.expectedCost !== coinsCost) {
      return NextResponse.json({ error: "Le prix a changé. Actualise la page avant de confirmer.", cost: coinsCost }, { status: 409 });
    }
    const result = await debitCoinsForFile(student.id, fileId, file.name, coinsCost);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Solde insuffisant", balance: result.newBalance, cost: coinsCost },
        { status: 402 } // Payment Required
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      cost: result.alreadyUnlocked ? 0 : coinsCost,
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
