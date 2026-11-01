import { NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import { createProject, getStudentProjects } from "@/lib/projects/store";
import { notifyAdmin } from "@/lib/email/notify";
import { adminAlertEmail } from "@/lib/email/messages";
import { canSubmitProjects } from "@/lib/access/server";

export async function GET() {
  try {
    const enrollment = await getSessionEnrollment();
    if (!enrollment) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const projects = await getStudentProjects(enrollment.id);
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Erreur GET /api/projects:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const enrollment = await getSessionEnrollment();
    if (!enrollment) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!canSubmitProjects(enrollment)) {
      return NextResponse.json(
        { error: "Le dépôt de projets s'ouvre avec le Mois 1, après le paiement de la 1re tranche." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { title, description, projectUrl, githubUrl, demoCredentials } = body;

    if (!title || !projectUrl) {
      return NextResponse.json({ error: "Titre et URL du projet obligatoires" }, { status: 400 });
    }

    const project = await createProject({
      enrollmentId: enrollment.id,
      title,
      description,
      projectUrl,
      githubUrl,
      demoCredentials,
    });

    // Alerte email pour le formateur / admin
    await notifyAdmin(
      adminAlertEmail("Nouveau projet soumis", [
        ["Apprenant", enrollment.fullName],
        ["Email", enrollment.email],
        ["Projet", title],
        ["Lien du site", projectUrl],
        ...(githubUrl ? ([["GitHub", githubUrl]] as [string, string][]) : []),
      ]),
    );

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("Erreur POST /api/projects:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
