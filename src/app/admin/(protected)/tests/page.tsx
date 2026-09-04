import { AdminQuizzesPanel } from "@/components/admin/AdminQuizzesPanel";
import { listQuizzes, listAllAttempts } from "@/lib/quiz/store";
import { listLessons } from "@/lib/store/programme";
import { brand } from "@/lib/config/formation";

export const metadata = {
  title: `Tests & Quiz — Admin ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function AdminQuizzesPage() {
  const [quizzes, attempts, lessons] = await Promise.all([
    listQuizzes(),
    listAllAttempts(),
    listLessons(),
  ]);

  return (
    <AdminQuizzesPanel
      initialQuizzes={quizzes}
      initialAttempts={attempts}
      lessons={lessons}
    />
  );
}
