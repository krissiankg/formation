/**
 * Calcule le coût en coins d'un fichier selon son poids en octets / Mo
 * 
 * Barème linéaire :
 * 1 - 50 Mo    = 10 coins
 * 51 - 100 Mo  = 15 coins
 * 101 - 200 Mo = 20 coins
 * 201 - 300 Mo = 30 coins
 * 301 - 400 Mo = 40 coins
 * 401 - 500 Mo = 50 coins
 * 501 - 600 Mo = 60 coins
 * 601 - 700 Mo = 70 coins
 * 701 - 800 Mo = 80 coins
 * 801 - 900 Mo = 90 coins
 * 901 - 1000 Mo = 100 coins
 * > 1000 Mo     = +10 coins par tranche de 100 Mo supplémentaire
 */
export function calculateFileCoinsCost(sizeInBytes?: number | string | null): number {
  if (!sizeInBytes) return 10;
  const bytes = typeof sizeInBytes === "string" ? Number.parseInt(sizeInBytes, 10) : sizeInBytes;
  if (Number.isNaN(bytes) || bytes <= 0) return 10;

  const sizeInMb = bytes / (1024 * 1024);

  if (sizeInMb <= 50) return 10;
  if (sizeInMb <= 100) return 15;
  if (sizeInMb <= 200) return 20;
  if (sizeInMb <= 300) return 30;
  if (sizeInMb <= 400) return 40;
  if (sizeInMb <= 500) return 50;
  if (sizeInMb <= 600) return 60;
  if (sizeInMb <= 700) return 70;
  if (sizeInMb <= 800) return 80;
  if (sizeInMb <= 900) return 90;
  if (sizeInMb <= 1000) return 100;

  // Au-delà de 1 Go : arrondi à la centaine supérieure * 10
  return Math.ceil(sizeInMb / 100) * 10;
}
