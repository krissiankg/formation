import { NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import {
  getQuizWithQuestions,
  getStudentQuizzes,
  submitQuizAttempt,
} from "@/lib/quiz/store";

export async function GET(request: Request) {
  try {
    const enrollment = await getSessionEnrollment();
    if (!enrollment) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("id");

    if (quizId) {
      const quiz = await getQuizWithQuestions(quizId);
      if (!quiz) {
        return NextResponse.json({ error: "Quiz introuvable" }, { status: 404 });
      }

      // Masquer la bonne réponse avant soumission pour empêcher la triche
      const sanitizedQuestions = quiz.questions?.map((q) => ({
        id: q.id,
        quizId: q.quizId,
        sortOrder: q.sortOrder,
        question: q.question,
        options: q.options,
      }));

      return NextResponse.json({
        quiz: {
          ...quiz,
          questions: sanitizedQuestions,
        },
      });
    }

    const quizzes = await getStudentQuizzes(enrollment.id);
    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("Erreur GET /api/quizzes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const enrollment = await getSessionEnrollment();
    if (!enrollment) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { quizId, answers } = body;

    if (!quizId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Données de soumission invalides" }, { status: 400 });
    }

    const result = await submitQuizAttempt(enrollment.id, quizId, answers);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erreur POST /api/quizzes:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
