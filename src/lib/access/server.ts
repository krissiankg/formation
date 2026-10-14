import { canAccessModule, getCourseAccess, type CourseAccess } from "@/lib/access/course-access";
import { listLessons, listModules } from "@/lib/store/programme";
import type { Enrollment } from "@/lib/types";

/** Identifiants des leçons des modules couverts par l'accès de l'apprenant. */
export async function getAccessibleLessonIds(access: CourseAccess): Promise<Set<string>> {
  const [modules, lessons] = await Promise.all([listModules(), listLessons()]);
  const openModules = new Set(modules.filter((m) => canAccessModule(access, m.sortOrder)).map((m) => m.id));
  return new Set(lessons.filter((l) => openModules.has(l.moduleId)).map((l) => l.id));
}

/** Un quiz est accessible si sa leçon appartient à un module ouvert (un quiz sans leçon suit le Mois 1). */
export async function canAccessQuiz(enrollment: Enrollment, quizLessonId: string | null): Promise<boolean> {
  const access = getCourseAccess(enrollment);
  if (!quizLessonId) return access.maxModuleSort >= 1;
  return (await getAccessibleLessonIds(access)).has(quizLessonId);
}

/** Le dépôt de projets s'ouvre avec le Mois 1 (1re tranche payée ou accès complet). */
export function canSubmitProjects(enrollment: Enrollment): boolean {
  return getCourseAccess(enrollment).maxModuleSort >= 1;
}
