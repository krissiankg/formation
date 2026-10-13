import type { LessonType } from "@/lib/programme/types";

export const LESSON_TYPES: LessonType[] = ["séance", "outil", "code", "test", "défi", "recherche"];

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  séance: "Séance",
  outil: "Outil IA",
  code: "Code",
  test: "Quiz",
  défi: "Défi",
  recherche: "Recherche",
};

export function isLessonType(value: unknown): value is LessonType {
  return typeof value === "string" && (LESSON_TYPES as string[]).includes(value);
}
