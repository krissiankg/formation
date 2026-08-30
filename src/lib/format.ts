import { formation } from "@/lib/config/formation";

export function formatFcfa(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} ${formation.currencyLabel}`;
}
