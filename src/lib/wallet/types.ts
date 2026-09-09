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
