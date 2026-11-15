const BENIN = "229";
/** Préfixe ajouté devant tous les numéros béninois lors du passage à 10 chiffres. */
const BENIN_PREFIX = "01";

/**
 * Numéro au format attendu par les liens wa.me : indicatif du pays puis numéro, chiffres seuls.
 * Les numéros béninois sont ramenés au format à 10 chiffres (01 XX XX XX XX), celui des comptes WhatsApp.
 */
export function toWhatsAppDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) return `${BENIN}${BENIN_PREFIX}${digits}`;
  if (digits.length === 10 && digits.startsWith(BENIN_PREFIX)) return `${BENIN}${digits}`;
  if (digits.length === 11 && digits.startsWith(BENIN)) return `${BENIN}${BENIN_PREFIX}${digits.slice(BENIN.length)}`;
  return digits;
}
