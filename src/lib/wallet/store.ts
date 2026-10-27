import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { StudentWallet, CoinTransaction } from "@/lib/wallet/types";

const WELCOME_BONUS_COINS = 20;

/** Solde en coins de chaque apprenant qui a déjà un portefeuille (clé = enrollment_id). */
export async function listWalletBalances(): Promise<Record<string, number>> {
  const { data, error } = await getSupabaseAdmin().from("student_wallets").select("enrollment_id, balance_coins");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((w) => [w.enrollment_id, w.balance_coins]));
}

/**
 * Récupère le portefeuille d'un étudiant. S'il n'existe pas encore, il est créé avec 20 coins offerts.
 */
export async function getOrCreateStudentWallet(enrollmentId: string): Promise<StudentWallet> {
  const supabase = getSupabaseAdmin();

  // 1. Chercher le portefeuille existant
  const { data: existing } = await supabase
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
  if (!Number.isSafeInteger(coinsCost) || coinsCost <= 0) throw new Error("Coût de fichier invalide.");
  await getOrCreateStudentWallet(enrollmentId);
  const { data, error } = await getSupabaseAdmin().rpc("unlock_resource_with_coins", {
    p_enrollment: enrollmentId,
    p_file_id: fileId,
    p_file_name: fileName,
    p_cost: coinsCost,
  });
  const result = data?.[0];
  if (error || !result || typeof result.success !== "boolean" || typeof result.already_unlocked !== "boolean" || !Number.isSafeInteger(result.new_balance) || result.new_balance < 0) {
    throw new Error("Impossible de débloquer la ressource pour le moment.");
  }
  return {
    success: Boolean(result.success),
    newBalance: result.new_balance,
    alreadyUnlocked: Boolean(result.already_unlocked),
    ...(!result.success ? { error: `Solde insuffisant : tu as ${result.new_balance} coins, cette archive en nécessite ${coinsCost}.` } : {}),
  };
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
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Crédit de coins invalide.");
  await getOrCreateStudentWallet(enrollmentId);
  const { data, error } = await getSupabaseAdmin().rpc("credit_wallet_coins", {
    p_enrollment: enrollmentId, p_amount: amount, p_type: type,
    p_description: description, p_reference: referenceId ?? null,
  });
  if (error || !Number.isSafeInteger(data) || data < 0) throw new Error("Échec du crédit de coins sur le portefeuille.");
  return data;
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

  return data.map((row: { id: string; enrollment_id: string; amount: number; type: CoinTransaction["type"]; description: string; reference_id: string | null; created_at: string }) => ({
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
