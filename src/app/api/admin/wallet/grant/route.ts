import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { grantAdminBonus } from "@/lib/wallet/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuth = await verifyAdminSessionToken(token);

  if (!isAuth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const target = body.target ? String(body.target).trim() : "";
    const amount = Number(body.amount);
    const reason = body.reason ? String(body.reason).trim() : "Bonus accordé par l'administrateur";

    if (!target) {
      return NextResponse.json({ error: "La cible (apprenant ou 'all') est requise." }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Le montant de coins doit être supérieur à zéro." }, { status: 400 });
    }

    const result = await grantAdminBonus(target, amount, reason);

    return NextResponse.json({
      success: true,
      count: result.count,
      target,
      amount,
    });
  } catch (err) {
    console.error("[Admin Grant Coins Error]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Erreur lors de l'octroi des coins" },
      { status: 500 }
    );
  }
}
