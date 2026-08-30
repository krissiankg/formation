import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildStudentProgress } from "@/lib/programme/compute";
import type { StudentProgress } from "@/lib/programme/types";
import { listLessons, listModules } from "@/lib/store/programme";

type ProgressRow = {
  enrollment_id: string;
  lesson_id: string;
  status: "completed" | "current";
  completed_at: string | null;
};

export async function getLessonProgressRows(enrollmentId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_lesson_progress")
    .select("*")
    .eq("enrollment_id", enrollmentId);

  if (error) throw error;
  return (data ?? []) as ProgressRow[];
}

export async function getStudentProgress(enrollmentId: string): Promise<StudentProgress> {
  const [modules, lessons, rows] = await Promise.all([
    listModules(),
    listLessons(),
    getLessonProgressRows(enrollmentId),
  ]);

  return buildStudentProgress(
    modules,
    lessons,
    rows.map((r) => ({ lessonId: r.lesson_id, status: r.status })),
  );
}

export async function markLessonCompleted(enrollmentId: string, lessonId: string) {
  const supabase = getSupabaseAdmin();
  const { error: completeError } = await supabase.from("student_lesson_progress").upsert(
    {
      enrollment_id: enrollmentId,
      lesson_id: lessonId,
      status: "completed",
      completed_at: new Date().toISOString(),
    },
    { onConflict: "enrollment_id,lesson_id" },
  );
  if (completeError) throw completeError;

  const progress = await getStudentProgress(enrollmentId);
  const nextLesson = progress.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.status === "locked");

  if (nextLesson) {
    await supabase.from("student_lesson_progress").upsert(
      {
        enrollment_id: enrollmentId,
        lesson_id: nextLesson.id,
        status: "current",
        completed_at: null,
      },
      { onConflict: "enrollment_id,lesson_id" },
    );
  }
}

export async function setLessonCurrent(enrollmentId: string, lessonId: string) {
  const supabase = getSupabaseAdmin();
  const rows = await getLessonProgressRows(enrollmentId);

  for (const row of rows.filter((r) => r.status === "current")) {
    await supabase
      .from("student_lesson_progress")
      .delete()
      .eq("enrollment_id", enrollmentId)
      .eq("lesson_id", row.lesson_id);
  }

  const { error } = await supabase.from("student_lesson_progress").upsert(
    {
      enrollment_id: enrollmentId,
      lesson_id: lessonId,
      status: "current",
      completed_at: null,
    },
    { onConflict: "enrollment_id,lesson_id" },
  );

  if (error) throw error;
}

export async function initStudentProgress(enrollmentId: string) {
  const rows = await getLessonProgressRows(enrollmentId);
  if (rows.length > 0) return;

  const lessons = await listLessons();
  const first = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  if (!first) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("student_lesson_progress").insert({
    enrollment_id: enrollmentId,
    lesson_id: first.id,
    status: "current",
    completed_at: null,
  });

  if (error) throw error;
}
