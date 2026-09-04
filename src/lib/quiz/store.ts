import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { FormationQuiz, QuizQuestion, StudentQuizAttempt, QuizWithStatus } from "./types";
import { markLessonCompleted } from "@/lib/store/progress";

type QuizRow = {
  id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
  active: boolean;
  created_at: string;
};

type QuestionRow = {
  id: string;
  quiz_id: string;
  sort_order: number;
  question: string;
  options: string[] | any;
  correct_option_index: number;
  explanation: string | null;
  created_at: string;
};

type AttemptRow = {
  id: string;
  quiz_id: string;
  enrollment_id: string;
  score_percent: number;
  passed: boolean;
  answers: any;
  completed_at: string;
  enrollments?: { full_name: string; phone: string } | null;
  formation_quizzes?: { title: string } | null;
};

function mapQuiz(row: QuizRow, questions?: QuestionRow[]): FormationQuiz {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    title: row.title,
    description: row.description ?? "",
    durationMinutes: row.duration_minutes ?? 15,
    passingScore: row.passing_score ?? 70,
    active: row.active ?? true,
    createdAt: row.created_at,
    questions: questions?.map(mapQuestion),
  };
}

function mapQuestion(row: QuestionRow): QuizQuestion {
  return {
    id: row.id,
    quizId: row.quiz_id,
    sortOrder: row.sort_order,
    question: row.question,
    options: Array.isArray(row.options) ? row.options : [],
    correctOptionIndex: row.correct_option_index ?? 0,
    explanation: row.explanation ?? undefined,
    createdAt: row.created_at,
  };
}

function mapAttempt(row: AttemptRow): StudentQuizAttempt {
  return {
    id: row.id,
    quizId: row.quiz_id,
    enrollmentId: row.enrollment_id,
    scorePercent: row.score_percent,
    passed: row.passed,
    answers: Array.isArray(row.answers) ? row.answers : [],
    completedAt: row.completed_at,
    studentName: row.enrollments?.full_name,
    studentPhone: row.enrollments?.phone,
    quizTitle: row.formation_quizzes?.title,
  };
}

export async function listQuizzes(onlyActive = false): Promise<FormationQuiz[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("formation_quizzes").select("*").order("created_at", { ascending: true });
  if (onlyActive) {
    query = query.eq("active", true);
  }

  const { data: quizzes, error } = await query;
  if (error) throw error;

  const { data: questions, error: qErr } = await supabase
    .from("formation_quiz_questions")
    .select("*")
    .order("sort_order", { ascending: true });
  if (qErr) throw qErr;

  return (quizzes as QuizRow[]).map((q) => {
    const qQuestions = (questions as QuestionRow[]).filter((qRow) => qRow.quiz_id === q.id);
    return mapQuiz(q, qQuestions);
  });
}

export async function getQuizWithQuestions(id: string): Promise<FormationQuiz | null> {
  const supabase = getSupabaseAdmin();
  const { data: quiz, error } = await supabase
    .from("formation_quizzes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !quiz) return null;

  const { data: questions, error: qErr } = await supabase
    .from("formation_quiz_questions")
    .select("*")
    .eq("quiz_id", id)
    .order("sort_order", { ascending: true });

  if (qErr) throw qErr;

  return mapQuiz(quiz as QuizRow, questions as QuestionRow[]);
}

export async function createQuiz(input: {
  title: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  lessonId?: string | null;
  active?: boolean;
}): Promise<FormationQuiz> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("formation_quizzes")
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      duration_minutes: input.durationMinutes ?? 15,
      passing_score: input.passingScore ?? 70,
      lesson_id: input.lessonId || null,
      active: input.active ?? true,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapQuiz(data as QuizRow);
}

export async function updateQuiz(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    lessonId: string | null;
    active: boolean;
  }>,
): Promise<FormationQuiz> {
  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.durationMinutes !== undefined) patch.duration_minutes = input.durationMinutes;
  if (input.passingScore !== undefined) patch.passing_score = input.passingScore;
  if (input.lessonId !== undefined) patch.lesson_id = input.lessonId || null;
  if (input.active !== undefined) patch.active = input.active;

  const { data, error } = await supabase
    .from("formation_quizzes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapQuiz(data as QuizRow);
}

export async function deleteQuiz(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("formation_quizzes").delete().eq("id", id);
  if (error) throw error;
}

export async function saveQuestions(
  quizId: string,
  questions: Omit<QuizQuestion, "id" | "quizId" | "createdAt">[],
): Promise<QuizQuestion[]> {
  const supabase = getSupabaseAdmin();
  // Supprimer les questions existantes pour ce quiz puis réinsérer
  await supabase.from("formation_quiz_questions").delete().eq("quiz_id", quizId);

  if (questions.length === 0) return [];

  const payload = questions.map((q, idx) => ({
    quiz_id: quizId,
    sort_order: q.sortOrder ?? idx + 1,
    question: q.question.trim(),
    options: q.options,
    correct_option_index: q.correctOptionIndex,
    explanation: q.explanation?.trim() || null,
  }));

  const { data, error } = await supabase
    .from("formation_quiz_questions")
    .insert(payload)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as QuestionRow[]).map(mapQuestion);
}

export async function getStudentQuizzes(enrollmentId: string): Promise<QuizWithStatus[]> {
  const supabase = getSupabaseAdmin();
  const [quizzes, attempts] = await Promise.all([
    listQuizzes(true),
    getStudentAttempts(enrollmentId),
  ]);

  return quizzes.map((quiz) => {
    const studentAttempts = attempts.filter((a) => a.quizId === quiz.id);
    // Dernier essai
    const lastAttempt = studentAttempts.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )[0] ?? null;

    let status: QuizWithStatus["status"] = "available";
    if (lastAttempt) {
      status = lastAttempt.passed ? "passed" : "failed";
    }

    return {
      ...quiz,
      lastAttempt,
      status,
      questionCount: quiz.questions?.length ?? 0,
    };
  });
}

export async function getStudentAttempts(enrollmentId: string): Promise<StudentQuizAttempt[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_quiz_attempts")
    .select("*, enrollments(full_name, phone), formation_quizzes(title)")
    .eq("enrollment_id", enrollmentId)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return (data as AttemptRow[]).map(mapAttempt);
}

export async function listAllAttempts(): Promise<StudentQuizAttempt[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_quiz_attempts")
    .select("*, enrollments(full_name, phone), formation_quizzes(title)")
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return (data as AttemptRow[]).map(mapAttempt);
}

export async function submitQuizAttempt(
  enrollmentId: string,
  quizId: string,
  userAnswers: { questionId: string; selectedOption: number }[],
): Promise<{
  attempt: StudentQuizAttempt;
  correctAnswersCount: number;
  totalQuestions: number;
  scorePercent: number;
  passed: boolean;
  explanations: Record<string, { correctOptionIndex: number; explanation?: string }>;
}> {
  const quiz = await getQuizWithQuestions(quizId);
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    throw new Error("Quiz introuvable ou vide");
  }

  let correctCount = 0;
  const detailedAnswers: StudentQuizAttempt["answers"] = [];
  const explanations: Record<string, { correctOptionIndex: number; explanation?: string }> = {};

  for (const q of quiz.questions) {
    explanations[q.id] = {
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
    };
    const found = userAnswers.find((a) => a.questionId === q.id);
    const selected = found !== undefined ? found.selectedOption : -1;
    const isCorrect = selected === q.correctOptionIndex;
    if (isCorrect) correctCount++;

    detailedAnswers.push({
      questionId: q.id,
      selectedOption: selected,
      isCorrect,
    });
  }

  const total = quiz.questions.length;
  const scorePercent = Math.round((correctCount / total) * 100);
  const passed = scorePercent >= quiz.passingScore;

  const supabase = getSupabaseAdmin();
  const { data: attemptRow, error } = await supabase
    .from("student_quiz_attempts")
    .insert({
      quiz_id: quizId,
      enrollment_id: enrollmentId,
      score_percent: scorePercent,
      passed,
      answers: detailedAnswers,
      completed_at: new Date().toISOString(),
    })
    .select("*, enrollments(full_name, phone), formation_quizzes(title)")
    .single();

  if (error) throw error;

  // Si le quiz est lié à une leçon du programme et qu'il est validé (passed), valider la leçon dans le programme !
  if (passed && quiz.lessonId) {
    try {
      await markLessonCompleted(enrollmentId, quiz.lessonId);
    } catch (e) {
      console.error("Erreur lors de la validation de la leçon associée au quiz:", e);
    }
  }

  return {
    attempt: mapAttempt(attemptRow as AttemptRow),
    correctAnswersCount: correctCount,
    totalQuestions: total,
    scorePercent,
    passed,
    explanations,
  };
}
