import { NextResponse } from "next/server";
import { listAllProjects, reviewProject } from "@/lib/projects/store";
import { getEnrollment } from "@/lib/store/enrollments";
import { notifyStudent } from "@/lib/email/notify";
import { projectReviewedEmail } from "@/lib/email/messages";

export async function GET() {
  try {
    const projects = await listAllProjects();
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Erreur GET /api/admin/projects:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, score, feedback } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const project = await reviewProject(id, {
      status,
      score: score !== undefined ? Number(score) : undefined,
      feedback,
    });

    // Email de retour à l'apprenant
    const student = await getEnrollment(project.enrollmentId);
    if (student) {
      await notifyStudent(
        student,
        projectReviewedEmail({
          firstname: student.fullName.trim().split(/\s+/)[0] ?? "",
          title: project.title,
          approved: status === "approved",
          score: project.score ?? null,
          feedback: typeof feedback === "string" ? feedback : "",
        }),
      );
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("Erreur PATCH /api/admin/projects:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
