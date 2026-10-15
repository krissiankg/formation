import { NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import { topUpIaFromCoins } from "@/lib/ia/usage-store";

/** Recharge le crédit IA de l'apprenant connecté avec ses coins (par multiples de 10). */
export async function POST(request: Request) {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { coins } = (await request.json().catch(() => ({}))) as { coins?: unknown };
  if (typeof coins !== "number" || !Number.isInteger(coins) || coins <= 0 || coins % 10 !== 0) {
    return NextResponse.json({ error: "Choisis un nombre de coins multiple de 10." }, { status: 400 });
  }

  try {
    await topUpIaFromCoins(enrollment.id, coins);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const insufficient = typeof error?.message === "string" && error.message.startsWith("Solde insuffisant");
    if (!insufficient) console.error("Erreur POST /api/ia/topup:", error);
    return NextResponse.json(
      { error: insufficient ? error.message : "Recharge impossible pour le moment." },
      { status: insufficient ? 400 : 500 },
    );
  }
}
