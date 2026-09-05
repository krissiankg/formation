import { NextResponse } from "next/server";
import { listAllProjects, reviewProject } from "@/lib/projects/store";
import { notifyWhatsApp } from "@/lib/integrations";

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

    // Notification WhatsApp de retour à l'apprenant
    if (project.studentWhatsapp) {
      try {
        const isApproved = status === "approved";
        const statusLabel = isApproved ? "✅ *Validé avec succès !*" : "⚠️ *Modifications demandées*";
        const scoreLine = project.score !== null ? `*Note attribuée :* ${project.score}/100\n` : "";
        const feedbackLine = feedback ? `\n💬 *Commentaire du formateur :*\n« ${feedback} »\n` : "";

        await notifyWhatsApp(
          project.studentWhatsapp,
          `🎯 *FORGEIA — Évaluation de ton projet SaaS*\n\n` +
            `*Projet :* ${project.title}\n` +
            `*Statut :* ${statusLabel}\n` +
            scoreLine +
            feedbackLine +
            `\nConsulte les détails dans ton espace : https://forgeia.guelichweb.store/espace/projets`
        );
      } catch (waErr) {
        console.error("[review:whatsapp:student:error]", waErr);
      }
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("Erreur PATCH /api/admin/projects:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
