import { getSessionEnrollment } from "@/lib/auth/session";
import { listPublishedContent } from "@/lib/store/content";
import { getStudentProgress, initStudentProgress } from "@/lib/store/progress";
import { getNextSession } from "@/lib/store/sessions";
import { getStudentTodos } from "@/lib/store/todos";

export async function getStudentContext() {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) return null;

  const isPaid = enrollment.payments.some(
    (p) => p.kind === "registration" && p.status === "paid",
  );

  if (isPaid) {
    await initStudentProgress(enrollment.id);
  }

  const [progress, nextSession, todos, contents] = await Promise.all([
    getStudentProgress(enrollment.id),
    getNextSession(enrollment.schedule),
    getStudentTodos(enrollment.id),
    listPublishedContent(),
  ]);

  return { enrollment, progress, nextSession, todos, contents, isPaid };
}
