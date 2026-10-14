import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccessibleLessonIds } from "@/lib/access/server";
import { PageHeader } from "@/components/espace/shared";
import { StudentTestsClient } from "@/components/espace/StudentTestsClient";
import { brand } from "@/lib/config/formation";
import { getStudentContext } from "@/lib/store/student-context";
import { getStudentQuizzes } from "@/lib/quiz/store";

export const metadata = {
  title: `Quiz — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function TestsPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  const [allQuizzes, accessible] = await Promise.all([
    getStudentQuizzes(ctx.enrollment.id),
    getAccessibleLessonIds(ctx.access),
  ]);
  const quizzes = allQuizzes.filter((q) => q.lessonId && accessible.has(q.lessonId));
  const lockedCount = allQuizzes.length - quizzes.length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        kicker="Évaluations"
        title="Quiz & Validation des acquis"
        description="Valide tes compétences après chaque séance. Obtiens ta note immédiate, tes explications détaillées et débloque ta progression."
      />
      {lockedCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] px-5 py-3">
          <p className="text-sm text-[color:var(--accent-darkest)]">
            🔒 {lockedCount} quiz {lockedCount > 1 ? "se débloqueront" : "se débloquera"} avec tes prochains paiements.
          </p>
          {ctx.access.blocked ? null : (
            <Link href="/espace/paiements" className="btn-primary !py-1.5 text-xs">
              Voir mes paiements →
            </Link>
          )}
        </div>
      ) : null}
      <StudentTestsClient quizzes={quizzes} />
    </div>
  );
}
