import { NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import { getStudentProgress, markLessonCompleted } from "@/lib/store/progress";

// L'apprenant marque comme terminée la leçon qu'il est en train de suivre.
export async function POST(request: Request) {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  try {
    const { lessonId } = (await request.json()) as { lessonId?: string };
    const progress = await getStudentProgress(enrollment.id);
    const lesson = progress.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);

    if (!lesson) {
      return NextResponse.json({ error: "Leçon introuvable" }, { status: 404 });
    }
    if (lesson.status === "locked" || lesson.status === "upcoming") {
      return NextResponse.json({ error: "Leçon pas encore disponible" }, { status: 403 });
    }

    await markLessonCompleted(enrollment.id, lesson.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[programme:progress]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
