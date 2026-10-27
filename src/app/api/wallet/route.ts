import { NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getOrCreateStudentWallet, listStudentUnlockedFileIds, listStudentTransactions } from "@/lib/wallet/store";
import { COIN_PACKS } from "@/lib/wallet/types";

export const dynamic = "force-dynamic";

export async function GET() {
  // Même priorité que les téléchargements : l'administration dispose d'un accès libre.
  if (await isAdminAuthenticated()) {
    return NextResponse.json({ authenticated: true, isAdmin: true, balance: 999999, unlockedFileIds: ["*"], transactions: [], packs: COIN_PACKS });
  }
  const student = await getSessionEnrollment();
  if (!student) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const wallet = await getOrCreateStudentWallet(student.id);
  const unlockedFileIds = await listStudentUnlockedFileIds(student.id);
  const transactions = await listStudentTransactions(student.id, 10);
  return NextResponse.json({ authenticated: true, isAdmin: false, balance: wallet.balanceCoins, unlockedFileIds, transactions, packs: COIN_PACKS });
}
