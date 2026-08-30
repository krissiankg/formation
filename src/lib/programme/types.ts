export type ModuleStatus = "completed" | "current" | "locked" | "upcoming";
export type LessonType = "séance" | "outil" | "code" | "test";
export type SessionSchedule = "saturday" | "sunday" | "both";

export type FormationModule = {
  id: string;
  sortOrder: number;
  monthLabel: string;
  title: string;
  createdAt: string;
};

export type FormationLesson = {
  id: string;
  moduleId: string;
  sortOrder: number;
  title: string;
  type: LessonType;
  duration: string;
  body: string;
  createdAt: string;
};

export type FormationSession = {
  id: string;
  title: string;
  sessionDate: string;
  hours: string;
  location: string;
  schedule: SessionSchedule;
  lessonId: string | null;
  createdAt: string;
};

export type FormationTodo = {
  id: string;
  title: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
};

export type CurriculumLesson = FormationLesson & {
  status: ModuleStatus;
};

export type CurriculumModule = FormationModule & {
  progress: number;
  status: ModuleStatus;
  lessons: CurriculumLesson[];
};

export type StudentProgress = {
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  lockedCount: number;
  currentModule: CurriculumModule | null;
  modules: CurriculumModule[];
};

export type StudentTodo = FormationTodo & {
  completed: boolean;
};
