import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { createPasswordResetToken, SETUP_LINK_VALIDITY_SECONDS } from "@/lib/auth/password-reset";
import { formation } from "@/lib/config/formation";
import { notifyStudent } from "@/lib/email/notify";
import {
  passwordLinkEmail,
  paymentReminderEmail,
  registrationReminderEmail,
  trainerMessageEmail,
} from "@/lib/email/messages";
import type { EmailMessage } from "@/lib/email/brevo";
import { siteOrigin } from "@/lib/config/site";
import { getEnrollment } from "@/lib/store/enrollments";
import { getWhatsAppGroupUrl } from "@/lib/settings/whatsapp-group";

/** Relance d'un inscrit par email depuis l'admin. */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!(await verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { enrollmentId?: string; type?: string; customMessage?: string };
    if (!body.enrollmentId) {
      return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
    }

    const enrollment = await getEnrollment(body.enrollmentId);
    if (!enrollment) {
      return NextResponse.json({ error: "Inscrit introuvable" }, { status: 404 });
    }

    const firstname = enrollment.fullName.trim().split(/\s+/)[0] ?? "";
    const scheduleLabel = formation.schedule[enrollment.schedule]?.label || enrollment.schedule;
    let message: EmailMessage;

    if (body.type === "registration") {
      // Inscrit pas encore validé : on le renvoie vers le groupe WhatsApp, où il règle sa préinscription.
      message = registrationReminderEmail({ firstname, scheduleLabel, groupUrl: await getWhatsAppGroupUrl() });
    } else if (body.type === "payment") {
      message = paymentReminderEmail({ firstname, scheduleLabel });
    } else if (body.type === "custom" && body.customMessage?.trim()) {
      message = trainerMessageEmail({ firstname, message: body.customMessage.trim() });
    } else if (body.type === "password") {
      // Premier mot de passe : lien de 7 jours ; changement de mot de passe : 1 heure.
      const setup = !enrollment.passwordHash;
      const token = setup
        ? createPasswordResetToken(enrollment, Date.now(), SETUP_LINK_VALIDITY_SECONDS)
        : createPasswordResetToken(enrollment);
      message = passwordLinkEmail({
        firstname,
        url: `${siteOrigin}/mot-de-passe/nouveau?token=${encodeURIComponent(token)}`,
        purpose: setup ? "setup" : "reset",
        validity: setup ? "7 jours" : "1 heure",
      });
    } else {
      return NextResponse.json({ error: "Type de message invalide" }, { status: 400 });
    }

    const sent = await notifyStudent(enrollment, message);
    if (!sent.ok) {
      return NextResponse.json({ error: "Échec de l'envoi de l'email" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, sentTo: enrollment.email });
  } catch (error) {
    console.error("[admin:remind]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
