import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEnrollment } from "@/lib/auth/session";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import {
  getOrCreateStudentWallet,
  listStudentUnlockedFileIds,
  listStudentTransactions,
} from "@/lib/wallet/store";
import { COIN_PACKS } from "@/lib/wallet/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const student = await getSessionEnrollment();

  if (student) {
    const wallet = await getOrCreateStudentWallet(student.id);
    const unlockedFileIds = await listStudentUnlockedFileIds(student.id);
    const transactions = await listStudentTransactions(student.id, 10);

    return NextResponse.json({
      authenticated: true,
      isAdmin: false,
      balance: wallet.balanceCoins,
      unlockedFileIds,
      transactions,
      packs: COIN_PACKS,
    });
  }

  // Vérifier si l'utilisateur est admin
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAdmin = await verifyAdminSessionToken(adminToken);

  if (isAdmin) {
    return NextResponse.json({
      authenticated: true,
      isAdmin: true,
      balance: 999999, // Admin a accès illimité
      unlockedFileIds: ["*"],
      transactions: [],
      packs: COIN_PACKS,
    });
  }

  return NextResponse.json({ error: "Non connecté" }, { status: 401 });
}
