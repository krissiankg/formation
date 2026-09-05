import { NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import { createProject, getStudentProjects } from "@/lib/projects/store";
import { notifyAdminWhatsApp } from "@/lib/integrations";

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

    // Alerte WhatsApp pour le formateur / admin
    try {
      await notifyAdminWhatsApp(
        `🚀 *FORGEIA — Nouveau projet SaaS soumis !*\n\n` +
          `👤 *Apprenant :* ${enrollment.fullName}\n` +
          `📱 *WhatsApp :* ${enrollment.whatsapp}\n` +
          `📦 *Projet :* ${title}\n` +
          `🔗 *Lien du site :* ${projectUrl}\n` +
          (githubUrl ? `💻 *GitHub :* ${githubUrl}\n` : "") +
          `\nConnecte-toi à l'admin pour l'évaluer : https://forgeia.guelichweb.store/admin/projets`
      );
    } catch (waErr) {
      console.error("[project:whatsapp:admin:error]", waErr);
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("Erreur POST /api/projects:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
