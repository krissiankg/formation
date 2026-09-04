export type QuizQuestion = {
  id: string;
  quizId: string;
  sortOrder: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  createdAt: string;
};

export type FormationQuiz = {
  id: string;
  lessonId: string | null;
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  active: boolean;
  createdAt: string;
  questions?: QuizQuestion[];
};

export type StudentQuizAttempt = {
  id: string;
  quizId: string;
  enrollmentId: string;
  scorePercent: number;
  passed: boolean;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[];
  completedAt: string;
  studentName?: string;
  studentPhone?: string;
  quizTitle?: string;
};

export type QuizWithStatus = FormationQuiz & {
  lastAttempt?: StudentQuizAttempt | null;
  status: "locked" | "available" | "passed" | "failed";
  questionCount: number;
};
