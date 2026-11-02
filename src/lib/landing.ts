const DAY_MS = 86_400_000;
/** Cotonou est à UTC+1 toute l'année (pas d'heure d'été). */
const BENIN_OFFSET_MS = 3_600_000;
/** Au-delà de ce nombre de places restantes, afficher le compteur desservirait l'inscription. */
const SEATS_SHOWN_FROM = 10;

/** Jours calendaires (heure de Cotonou) avant le démarrage, ou null une fois la cohorte lancée. */
export function daysUntilStart(startDate: string, now: Date): number | null {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const todayInBenin = Math.floor((now.getTime() + BENIN_OFFSET_MS) / DAY_MS) * DAY_MS;
  const days = Math.round((start - todayInBenin) / DAY_MS);
  return days < 0 ? null : days;
}

export function countdownLabel(days: number | null): string | null {
  if (days === null) return null;
  if (days === 0) return "Démarrage aujourd'hui";
  if (days === 1) return "Démarrage demain";
  return `Démarrage dans ${days} jours`;
}

/** Libellé de places restantes pour une classe, seulement quand il pousse à agir. */
export function seatsLabel(seat: { left: number; full: boolean }): string | null {
  if (seat.full) return "Complet";
  if (seat.left > SEATS_SHOWN_FROM) return null;
  return seat.left === 1 ? "Plus qu'une place" : `Plus que ${seat.left} places`;
}
