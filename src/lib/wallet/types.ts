export interface CoinPack {
  id: string;
  coins: number;
  priceFcfa: number;
  title: string;
  badge?: string;
  popular?: boolean;
  description: string;
}

export const COIN_PACKS: CoinPack[] = [
  {
    id: "pack_10",
    coins: 10,
    priceFcfa: 500,
    title: "Pack Starter",
    description: "Idéal pour débloquer 1 template standard (1 à 50 Mo)",
  },
  {
    id: "pack_50",
    coins: 50,
    priceFcfa: 2350,
    title: "Pack Medium",
    badge: "Populaire",
    description: "Idéal pour 3 à 5 templates ou packs complets",
  },
  {
    id: "pack_100",
    coins: 100,
    priceFcfa: 4500,
    title: "Pack Pro",
    badge: "Recommandé",
    popular: true,
    description: "Économie de 10% — parfait pour monter une vraie boîte à outils",
  },
  {
    id: "pack_250",
    coins: 250,
    priceFcfa: 10000,
    title: "Pack Studio",
    badge: "Meilleure valeur",
    description: "Accès étendu aux plus gros packs 3D et dashboards complexes",
  },
];

export interface StudentWallet {
  enrollmentId: string;
  balanceCoins: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoinTransaction {
  id: string;
  enrollmentId: string;
  amount: number;
  type: "welcome_bonus" | "fedapay_purchase" | "file_unlock" | "admin_bonus" | "quiz_reward";
  description: string;
  referenceId?: string | null;
  createdAt: string;
}

export interface UnlockedFile {
  enrollmentId: string;
  fileId: string;
  fileName: string;
  coinsSpent: number;
  unlockedAt: string;
}

/**
 * Calcule le prix en FCFA pour un nombre de coins donné (multiple de 10)
 * avec paliers dégressifs calqués sur les packs officiels :
 * - 10 à 40 coins : 50 FCFA / coin (ex: 10 = 500 F, 20 = 1 000 F, 30 = 1 500 F)
 * - 50 à 90 coins : 47 FCFA / coin (ex: 50 = 2 350 F, 60 = 2 820 F, 80 = 3 760 F)
 * - 100 à 240 coins : 45 FCFA / coin (ex: 100 = 4 500 F, 150 = 6 750 F, 200 = 9 000 F)
 * - 250+ coins : 40 FCFA / coin (ex: 250 = 10 000 F, 300 = 12 000 F, 500 = 20 000 F)
 */
export function calculateCoinsPriceFcfa(coins: number): number {
  if (coins <= 0) return 0;
  if (coins < 10) return 500;

  // Si le nombre correspond exactement à un pack officiel, renvoyer son prix exact
  const exactPack = COIN_PACKS.find((p) => p.coins === coins);
  if (exactPack) return exactPack.priceFcfa;

  if (coins >= 250) {
    return Math.round(coins * 40);
  }
  if (coins >= 100) {
    return Math.round(coins * 45);
  }
  if (coins >= 50) {
    return Math.round(coins * 47);
  }
  return Math.round(coins * 50);
}

/**
 * Renvoie le tarif unitaire en FCFA par coin selon le volume
 */
export function getCoinsUnitPriceFcfa(coins: number): number {
  if (coins >= 250) return 40;
  if (coins >= 100) return 45;
  if (coins >= 50) return 47;
  return 50;
}

/**
 * Renvoie le pourcentage d'économie par rapport au tarif de base (50 FCFA / coin)
 */
export function getCoinsDiscountPercent(coins: number): number {
  const unit = getCoinsUnitPriceFcfa(coins);
  if (unit >= 50) return 0;
  return Math.round(((50 - unit) / 50) * 100);
}
