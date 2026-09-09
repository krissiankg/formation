import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { StudentWallet, CoinTransaction, UnlockedFile } from "@/lib/wallet/types";

const WELCOME_BONUS_COINS = 20;

/**
 * Récupère le portefeuille d'un étudiant. S'il n'existe pas encore, il est créé avec 20 coins offerts.
 */
export async function getOrCreateStudentWallet(enrollmentId: string): Promise<StudentWallet> {
  const supabase = getSupabaseAdmin();

  // 1. Chercher le portefeuille existant
  const { data: existing, error: fetchErr } = await supabase
    .from("student_wallets")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();

  if (existing) {
    return {
      enrollmentId: existing.enrollment_id,
      balanceCoins: existing.balance_coins,
      createdAt: existing.created_at,
      updatedAt: existing.updated_at,
    };
  }

  // 2. Créer avec le bonus de bienvenue
  const { data: created, error: insertErr } = await supabase
    .from("student_wallets")
    .insert({
      enrollment_id: enrollmentId,
      balance_coins: WELCOME_BONUS_COINS,
    })
    .select("*")
    .single();

  if (insertErr || !created) {
    // En cas de conflit (déjà créé en parallèle), relire
    const { data: retry } = await supabase
      .from("student_wallets")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .single();

    if (retry) {
      return {
        enrollmentId: retry.enrollment_id,
        balanceCoins: retry.balance_coins,
        createdAt: retry.created_at,
        updatedAt: retry.updated_at,
      };
    }
    throw insertErr || new Error("Impossible de créer le portefeuille étudiant");
  }

  // Enregistrer la transaction du bonus de bienvenue
  await supabase.from("coin_transactions").insert({
    enrollment_id: enrollmentId,
    amount: WELCOME_BONUS_COINS,
    type: "welcome_bonus",
    description: `Bonus de bienvenue (${WELCOME_BONUS_COINS} coins offerts)`,
  });

  return {
    enrollmentId: created.enrollment_id,
    balanceCoins: created.balance_coins,
    createdAt: created.created_at,
    updatedAt: created.updated_at,
  };
}

/**
 * Récupère la liste des IDs de fichiers débloqués à vie par l'étudiant
 */
export async function listStudentUnlockedFileIds(enrollmentId: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_unlocked_files")
    .select("file_id")
    .eq("enrollment_id", enrollmentId);

  if (error || !data) return [];
  return data.map((row: { file_id: string }) => row.file_id);
}

/**
 * Vérifie si un fichier spécifique a déjà été débloqué par l'étudiant
 */
export async function hasStudentUnlockedFile(enrollmentId: string, fileId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("student_unlocked_files")
    .select("file_id")
    .eq("enrollment_id", enrollmentId)
    .eq("file_id", fileId)
    .maybeSingle();

  return Boolean(data);
}

/**
 * Débloque un fichier en déduisant les coins du solde (si non déjà débloqué)
 */
export async function debitCoinsForFile(
  enrollmentId: string,
  fileId: string,
  fileName: string,
  coinsCost: number
): Promise<{ success: boolean; newBalance: number; alreadyUnlocked?: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();

  // 1. Vérifier si déjà débloqué
  const already = await hasStudentUnlockedFile(enrollmentId, fileId);
  const wallet = await getOrCreateStudentWallet(enrollmentId);

  if (already) {
    return { success: true, newBalance: wallet.balanceCoins, alreadyUnlocked: true };
  }

  // 2. Vérifier le solde
  if (wallet.balanceCoins < coinsCost) {
    return {
      success: false,
      newBalance: wallet.balanceCoins,
      error: `Solde insuffisant : vous avez ${wallet.balanceCoins} coins, ce fichier en nécessite ${coinsCost}.`,
    };
  }

  const newBalance = wallet.balanceCoins - coinsCost;

  // 3. Mettre à jour le solde
  const { error: updateErr } = await supabase
    .from("student_wallets")
    .update({
      balance_coins: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("enrollment_id", enrollmentId);

  if (updateErr) {
    throw new Error("Échec de la mise à jour du portefeuille.");
  }

  // 4. Enregistrer dans les fichiers débloqués
  await supabase.from("student_unlocked_files").insert({
    enrollment_id: enrollmentId,
    file_id: fileId,
    file_name: fileName,
    coins_spent: coinsCost,
  });

  // 5. Enregistrer la transaction
  await supabase.from("coin_transactions").insert({
    enrollment_id: enrollmentId,
    amount: -coinsCost,
    type: "file_unlock",
    description: `Déblocage du template : ${fileName}`,
    reference_id: fileId,
  });

  return { success: true, newBalance, alreadyUnlocked: false };
}

/**
 * Crédite des coins sur le portefeuille d'un étudiant (recharge FedaPay, bonus, etc.)
 */
export async function creditCoins(
  enrollmentId: string,
  amount: number,
  type: CoinTransaction["type"],
  description: string,
  referenceId?: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const wallet = await getOrCreateStudentWallet(enrollmentId);
  const newBalance = wallet.balanceCoins + amount;

  const { error: updateErr } = await supabase
    .from("student_wallets")
    .update({
      balance_coins: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("enrollment_id", enrollmentId);

  if (updateErr) {
    throw new Error("Échec du crédit de coins sur le portefeuille.");
  }

  await supabase.from("coin_transactions").insert({
    enrollment_id: enrollmentId,
    amount,
    type,
    description,
    reference_id: referenceId ?? null,
  });

  return newBalance;
}

/**
 * Récupère l'historique récent des transactions de coins
 */
export async function listStudentTransactions(
  enrollmentId: string,
  limit = 20
): Promise<CoinTransaction[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("coin_transactions")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    enrollmentId: row.enrollment_id,
    amount: row.amount,
    type: row.type,
    description: row.description,
    referenceId: row.reference_id,
    createdAt: row.created_at,
  }));
}

/**
 * Permet à l'administrateur d'octroyer des coins gratuits
 */
export async function grantAdminBonus(
  target: string | "all",
  amount: number,
  reason: string
): Promise<{ count: number }> {
  const supabase = getSupabaseAdmin();

  if (target === "all") {
    const { data: enrollments, error } = await supabase.from("enrollments").select("id");
    if (error || !enrollments) return { count: 0 };

    for (const e of enrollments) {
      await creditCoins(e.id, amount, "admin_bonus", reason);
    }
    return { count: enrollments.length };
  }

  await creditCoins(target, amount, "admin_bonus", reason);
  return { count: 1 };
}
