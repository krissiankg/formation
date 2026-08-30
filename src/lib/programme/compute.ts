import type {
  CurriculumModule,
  FormationLesson,
  FormationModule,
  ModuleStatus,
  StudentProgress,
} from "@/lib/programme/types";

type ProgressRow = { lessonId: string; status: "completed" | "current" };

function lessonStatus(
  lessonId: string,
  completedIds: Set<string>,
  currentId: string | null,
): ModuleStatus {
  if (completedIds.has(lessonId)) return "completed";
  if (lessonId === currentId) return "current";
  return "locked";
}

function moduleStatus(lessons: { status: ModuleStatus }[]): ModuleStatus {
  if (lessons.length === 0) return "upcoming";
  if (lessons.every((l) => l.status === "completed")) return "completed";
  if (lessons.some((l) => l.status === "current" || l.status === "completed")) return "current";
  return "upcoming";
}

export function buildStudentProgress(
  modules: FormationModule[],
  lessons: FormationLesson[],
  progressRows: ProgressRow[],
): StudentProgress {
  const sortedModules = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortedLessons = [...lessons].sort((a, b) => {
    const modA = sortedModules.findIndex((m) => m.id === a.moduleId);
    const modB = sortedModules.findIndex((m) => m.id === b.moduleId);
    if (modA !== modB) return modA - modB;
    return a.sortOrder - b.sortOrder;
  });

  const completedIds = new Set(
    progressRows.filter((r) => r.status === "completed").map((r) => r.lessonId),
  );
  const explicitCurrent = progressRows.find((r) => r.status === "current")?.lessonId ?? null;

  let currentId = explicitCurrent;
  if (!currentId) {
    currentId = sortedLessons.find((l) => !completedIds.has(l.id))?.id ?? null;
  }

  const curriculumModules: CurriculumModule[] = sortedModules.map((mod) => {
    const modLessons = sortedLessons
      .filter((l) => l.moduleId === mod.id)
      .map((lesson) => ({
        ...lesson,
        status: lessonStatus(lesson.id, completedIds, currentId),
      }));

    const completedInMod = modLessons.filter((l) => l.status === "completed").length;
    const progress =
      modLessons.length > 0 ? Math.round((completedInMod / modLessons.length) * 100) : 0;

    return {
      ...mod,
      progress,
      status: moduleStatus(modLessons),
      lessons: modLessons,
    };
  });

  const totalLessons = sortedLessons.length;
  const completedLessons = completedIds.size;
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const lockedCount = sortedLessons.filter(
    (l) => lessonStatus(l.id, completedIds, currentId) === "locked",
  ).length;

  const currentModule =
    curriculumModules.find((m) => m.status === "current") ?? curriculumModules[0] ?? null;

  return {
    overallProgress,
    completedLessons,
    totalLessons,
    lockedCount,
    currentModule,
    modules: curriculumModules,
  };
}
