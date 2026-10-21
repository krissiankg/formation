import { formation } from "@/lib/config/formation";
import type { PaymentKind } from "@/lib/types";

export type InstallmentKind = Exclude<PaymentKind, "registration">;

// Libellé de repli pour les échéances qui n'existent plus dans la configuration
// (ex. 3e tranche de l'ancien programme de 3 mois), afin que les anciens inscrits restent lisibles.
const LEGACY_LABELS: Record<InstallmentKind, string> = {
  start: "Tranche 1",
  month1: "Tranche 2",
  month3: "Tranche 3 (ancien échéancier)",
};

export function getInstallmentConfig(kind: string) {
  return formation.installments.find((inst) => inst.id === kind) ?? null;
}

export function getInstallmentLabel(kind: PaymentKind): string {
  if (kind === "registration") return "Préinscription";
  return getInstallmentConfig(kind)?.label ?? LEGACY_LABELS[kind];
}

/** Échéances payables (anciennes comprises, pour les inscrits de l'ancien programme). */
export const PAYABLE_INSTALLMENTS: InstallmentKind[] = ["start", "month1", "month3"];

/** Référence enregistrée pour un paiement saisi à la main par l'admin (espèces, Mobile Money direct…). */
export const MANUAL_PAYMENT_REF = "manuel-admin";
