import { NextResponse } from "next/server";
import { getEnrollment } from "@/lib/store/enrollments";
import { notifyWhatsApp } from "@/lib/integrations";
import { formation } from "@/lib/config/formation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enrollmentId, type, customMessage } = body;

    if (!enrollmentId) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const enrollment = await getEnrollment(enrollmentId);
    if (!enrollment) {
      return NextResponse.json({ error: "Inscrit introuvable" }, { status: 404 });
    }

    let message = "";
    const firstname = enrollment.fullName.trim().split(/\s+/)[0];
    const scheduleLabel = formation.schedule[enrollment.schedule]?.label || enrollment.schedule;

    if (type === "registration") {
      message =
        `Bonjour ${firstname},\n\n` +
        `Votre inscription à la formation *FORGEIA* (${scheduleLabel}) est toujours en attente.\n\n` +
        `Pour sécuriser votre place avant la clôture de la cohorte :\n` +
        `👉 https://forgeia.guelichweb.store/inscription/confirmation?id=${enrollment.id}\n\n` +
        `Besoin d'aide ? Répondez directement à ce message WhatsApp.`;
    } else if (type === "payment") {
      message =
        `Bonjour ${firstname},\n\n` +
        `Rappel amical concernant votre parcours *FORGEIA* (${scheduleLabel}).\n\n` +
        `Une échéance de votre formation est à régulariser dans votre espace apprenant :\n` +
        `👉 https://forgeia.guelichweb.store/espace/paiements\n\n` +
        `Merci de votre engagement et bonne continuation dans vos projets !`;
    } else if (type === "custom" && customMessage) {
      message = customMessage.trim();
    } else {
      return NextResponse.json({ error: "Type de message invalide" }, { status: 400 });
    }

    const res = await notifyWhatsApp(enrollment.whatsapp, message);
    if (!res || !res.ok) {
      return NextResponse.json({ error: "Échec de l'envoi WhatsApp" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sentTo: enrollment.whatsapp });
  } catch (error: any) {
    console.error("Erreur /api/admin/whatsapp/remind:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
