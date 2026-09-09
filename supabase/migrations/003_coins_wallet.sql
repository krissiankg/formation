-- 003_coins_wallet.sql : Système de portefeuille, transactions de coins et déblocage de fichiers à vie

-- 1. Table des portefeuilles étudiants
CREATE TABLE IF NOT EXISTS public.student_wallets (
  enrollment_id UUID PRIMARY KEY REFERENCES public.enrollments(id) ON DELETE CASCADE,
  balance_coins INTEGER NOT NULL DEFAULT 20 CHECK (balance_coins >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table des transactions de coins
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('welcome_bonus', 'fedapay_purchase', 'file_unlock', 'admin_bonus', 'quiz_reward')),
  description TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table des fichiers débloqués à vie par étudiant
CREATE TABLE IF NOT EXISTS public.student_unlocked_files (
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  coins_spent INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (enrollment_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_enrollment ON public.coin_transactions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_files_enrollment ON public.student_unlocked_files(enrollment_id);

-- 4. Initialisation des portefeuilles pour tous les étudiants existants avec 20 coins de bienvenue offerts
INSERT INTO public.student_wallets (enrollment_id, balance_coins)
SELECT id, 20 FROM public.enrollments
ON CONFLICT (enrollment_id) DO NOTHING;

-- Enregistrement de la transaction initiale pour les étudiants existants
INSERT INTO public.coin_transactions (enrollment_id, amount, type, description)
SELECT id, 20, 'welcome_bonus', 'Bonus de bienvenue (20 coins offerts)'
FROM public.enrollments
WHERE id NOT IN (SELECT enrollment_id FROM public.coin_transactions WHERE type = 'welcome_bonus');
