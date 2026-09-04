import { redirect } from "next/navigation";
import { PageHeader } from "@/components/espace/shared";
import { StudentTestsClient } from "@/components/espace/StudentTestsClient";
import { brand } from "@/lib/config/formation";
import { getStudentContext } from "@/lib/store/student-context";
import { getStudentQuizzes } from "@/lib/quiz/store";

export const metadata = {
  title: `Tests & Quiz — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function TestsPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  const quizzes = await getStudentQuizzes(ctx.enrollment.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        kicker="Évaluations"
        title="Quiz & Validation des acquis"
        description="Valide tes compétences après chaque séance. Obtiens ta note immédiate, tes explications détaillées et débloque ta progression."
      />
      <StudentTestsClient quizzes={quizzes} />
    </div>
  );
}
