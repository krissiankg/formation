import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PendingCounts = {
  /** Projets déposés ou en cours d'examen, en attente d'une note. */
  projects: number;
  /** Avis en attente de modération. */
  testimonials: number;
};

async function countRows(table: string, column: string, values: string[]): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from(table)
    .select("*", { count: "exact", head: true })
    .in(column, values);
  if (error) {
    console.error(`[admin:pending-counts] ${table}:`, error.message);
    return 0;
  }
  return count ?? 0;
}

/** Compteurs du menu admin. Une erreur de base ne doit jamais empêcher l'admin de s'afficher. */
export async function getPendingCounts(): Promise<PendingCounts> {
  try {
    const [projects, testimonials] = await Promise.all([
      countRows("student_projects", "status", ["submitted", "in_review"]),
      countRows("student_testimonials", "status", ["pending"]),
    ]);
    return { projects, testimonials };
  } catch (error) {
    console.error("[admin:pending-counts]", error);
    return { projects: 0, testimonials: 0 };
  }
}
