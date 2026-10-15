import { NextResponse } from "next/server";
import { setIaBudget } from "@/lib/ia/usage-store";

/** Fixe le crédit IA d'un apprenant (null = budget par défaut). Route protégée par src/proxy.ts. */
export async function POST(request: Request) {
  const { id, budgetFcfa } = (await request.json().catch(() => ({}))) as { id?: unknown; budgetFcfa?: unknown };
  const valid =
    budgetFcfa === null || (typeof budgetFcfa === "number" && Number.isInteger(budgetFcfa) && budgetFcfa >= 0 && budgetFcfa <= 1_000_000);
  if (typeof id !== "string" || !id || !valid) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
  try {
    await setIaBudget(id, budgetFcfa as number | null);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/ia/budget:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
