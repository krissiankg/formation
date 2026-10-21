import { formation } from "@/lib/config/formation";
import { computeSeats, type Seats } from "@/lib/enrollment/seats";
import { listEnrollments } from "@/lib/store/enrollments";

/** Places restantes par classe, d'après les préinscriptions payées. */
export async function getSeats(): Promise<Seats> {
  return computeSeats(await listEnrollments(), formation.maxPerClass);
}
