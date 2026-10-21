import type { ScheduleId } from "@/lib/types";

export type Seats = Record<ScheduleId, { taken: number; left: number; full: boolean }>;

type SeatEnrollment = { schedule: ScheduleId; payments: { kind: string; status: string }[] };

const SCHEDULES: ScheduleId[] = ["saturday", "saturday_pm", "sunday"];

/** Places prises (préinscriptions payées) et restantes pour chaque classe. */
export function computeSeats(enrollments: SeatEnrollment[], maxPerClass: number): Seats {
  const seats = {} as Seats;
  for (const schedule of SCHEDULES) {
    const taken = enrollments.filter(
      (e) => e.schedule === schedule && e.payments.some((p) => p.kind === "registration" && p.status === "paid"),
    ).length;
    seats[schedule] = { taken, left: Math.max(0, maxPerClass - taken), full: taken >= maxPerClass };
  }
  return seats;
}
