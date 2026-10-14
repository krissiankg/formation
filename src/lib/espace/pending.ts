import { getCourseAccess } from "@/lib/access/course-access";
import { getInstallmentConfig } from "@/lib/programme/installments";
import { getStudentQuizzes } from "@/lib/quiz/store";
import { getStudentProgress } from "@/lib/store/progress";
import type { Enrollment } from "@/lib/types";

export type StudentPending = {
  /** Quiz dont la leçon est débloquée et qui ne sont pas encore réussis. */
  quizzes: number;
  /** Une tranche (ou l'inscription) est à payer maintenant. */
  paymentDue: boolean;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Vrai si le prochain paiement en attente est échu (l'inscription l'est toujours). */
export function isPaymentDue(enrollment: Enrollment, today = todayIso()): boolean {
  const order = ["registration", "start", "month1", "month3"];
  const next = [...enrollment.payments]
    .filter((p) => p.status !== "paid")
    .sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))[0];
  if (!next) return false;
  if (next.kind === "registration") return true;
  const dueDate = getInstallmentConfig(next.kind)?.dueDate;
  return dueDate ? dueDate <= today : false;
}

/** Compteurs du menu apprenant. Une erreur ne doit jamais empêcher l'espace de s'afficher. */
export async function getStudentPending(enrollment: Enrollment): Promise<StudentPending> {
  const paymentDue = isPaymentDue(enrollment);
  try {
    const [progress, quizzes] = await Promise.all([
      getStudentProgress(enrollment.id, getCourseAccess(enrollment)),
      getStudentQuizzes(enrollment.id),
    ]);
    const unlocked = new Set(
      progress.modules
        .flatMap((m) => m.lessons)
        .filter((l) => l.status === "current" || l.status === "completed")
        .map((l) => l.id),
    );
    const toDo = quizzes.filter((q) => q.lessonId && unlocked.has(q.lessonId) && q.status !== "passed").length;
    return { quizzes: toDo, paymentDue };
  } catch (error) {
    console.error("[espace:pending]", error);
    return { quizzes: 0, paymentDue };
  }
}
