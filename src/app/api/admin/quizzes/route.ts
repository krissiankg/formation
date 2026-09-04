import { NextResponse } from "next/server";
import {
  createQuiz,
  deleteQuiz,
  listQuizzes,
  saveQuestions,
  updateQuiz,
  listAllAttempts,
} from "@/lib/quiz/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    if (view === "attempts") {
      const attempts = await listAllAttempts();
      return NextResponse.json({ attempts });
    }

    const quizzes = await listQuizzes();
    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case "createQuiz": {
        if (!body.title) {
          return NextResponse.json({ error: "Titre requis" }, { status: 400 });
        }
        const quiz = await createQuiz({
          title: body.title,
          description: body.description,
          durationMinutes: body.durationMinutes ? Number(body.durationMinutes) : 15,
          passingScore: body.passingScore ? Number(body.passingScore) : 70,
          lessonId: body.lessonId || null,
          active: body.active !== undefined ? Boolean(body.active) : true,
        });

        if (Array.isArray(body.questions) && body.questions.length > 0) {
          await saveQuestions(quiz.id, body.questions);
        }

        return NextResponse.json({ quiz });
      }

      case "updateQuiz": {
        if (!body.id) {
          return NextResponse.json({ error: "ID requis" }, { status: 400 });
        }
        const quiz = await updateQuiz(body.id, {
          title: body.title,
          description: body.description,
          durationMinutes: body.durationMinutes !== undefined ? Number(body.durationMinutes) : undefined,
          passingScore: body.passingScore !== undefined ? Number(body.passingScore) : undefined,
          lessonId: body.lessonId,
          active: body.active !== undefined ? Boolean(body.active) : undefined,
        });

        if (Array.isArray(body.questions)) {
          await saveQuestions(body.id, body.questions);
        }

        return NextResponse.json({ quiz });
      }

      case "deleteQuiz": {
        if (!body.id) {
          return NextResponse.json({ error: "ID requis" }, { status: 400 });
        }
        await deleteQuiz(body.id);
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
    }
  } catch (error) {
    console.error("Erreur API Admin Quiz:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
