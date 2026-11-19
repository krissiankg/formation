import { NextResponse } from "next/server";
import { validateInscription } from "@/lib/types";
import { createEnrollment, findEnrollmentByEmail } from "@/lib/store/enrollments";
import { formation } from "@/lib/config/formation";
import { notifyTelegram } from "@/lib/integrations";
import { createSession, getSessionEnrollment } from "@/lib/auth/session";
import { hasRegistrationAccess } from "@/lib/access/registration";
import { notifyAdmin, notifyStudent } from "@/lib/email/notify";
import { accountCreatedEmail, adminAlertEmail } from "@/lib/email/messages";
import { formatFcfa } from "@/lib/format";
import { getSeats } from "@/lib/enrollment/seats-server";
import { getWhatsAppGroupUrl } from "@/lib/settings/whatsapp-group";

/**
 * Inscription sans paiement en ligne ni mot de passe. L'inscrit arrive sur la page Merci, qui l'envoie
 * dans le groupe WhatsApp : il y règle sa préinscription au formateur, qui la valide dans l'admin.
 * C'est cette validation qui ouvre l'espace apprenant et envoie le lien pour créer le mot de passe.
 */
const THANK_YOU_PAGE = "/inscription/merci";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateInscription(body);

    if (!parsed.data) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const data = parsed.data;

    const existing = await findEnrollmentByEmail(data.email);
    if (existing) {
      // Même inscrit qui renvoie le formulaire (double clic, erreur réseau) : on le ramène à la page Merci.
      const session = await getSessionEnrollment();
      if (session?.id === existing.id && !hasRegistrationAccess(existing)) {
        return NextResponse.json({ enrollmentId: existing.id, redirectTo: THANK_YOU_PAGE });
      }
      // Sans mot de passe, un inscrit non validé ne peut pas se connecter : on lui dit où retrouver le groupe.
      return NextResponse.json(
        {
          error: hasRegistrationAccess(existing)
            ? "Un compte existe déjà avec cet email. Connecte-toi pour continuer."
            : "Tu es déjà inscrit avec cet email. Le lien du groupe WhatsApp est dans ton email de confirmation ; sinon, écris au formateur sur WhatsApp.",
        },
        { status: 409 },
      );
    }

    // Seules les classes ouvertes pour cette cohorte acceptent des inscriptions.
    if (!formation.openSchedules.includes(data.schedule)) {
      return NextResponse.json(
        { error: `La classe « ${formation.schedule[data.schedule].label} » n'est pas ouverte pour cette cohorte.` },
        { status: 409 },
      );
    }

    // 20 places maximum par classe, comptées sur les préinscriptions validées.
    const seats = await getSeats();
    if (seats[data.schedule].full) {
      return NextResponse.json(
        {
          error: `Le créneau « ${formation.schedule[data.schedule].label} » est complet. Choisis un autre créneau.`,
        },
        { status: 409 },
      );
    }

    // L'échéancier ne change pas : la préinscription reste due, mais elle se règle au formateur.
    const enrollment = await createEnrollment({
      fullName: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      schedule: data.schedule,
      payments: [
        {
          kind: "registration",
          amount: formation.registrationFee,
          status: "pending",
        },
        ...formation.installments.map((inst) => ({
          kind: inst.id,
          amount: inst.amount,
          status: "pending" as const,
        })),
      ],
    });

    // La session sert seulement à afficher la page Merci : l'espace reste fermé jusqu'à la validation.
    await createSession(enrollment.id);

    const firstname = data.fullName.trim().split(/\s+/)[0];
    const scheduleLabel = formation.schedule[data.schedule]?.label || data.schedule;
    const fee = formatFcfa(formation.registrationFee);

    // Les notifications ne doivent jamais empêcher l'inscription d'aboutir.
    await Promise.allSettled([
      getWhatsAppGroupUrl().then((groupUrl) =>
        notifyStudent(enrollment, accountCreatedEmail({ firstname, scheduleLabel, groupUrl })),
      ),
      notifyAdmin(
        adminAlertEmail("Nouvelle inscription", [
          ["Nom", data.fullName],
          ["Email", data.email],
          ["WhatsApp", data.whatsapp],
          ["Créneau", scheduleLabel],
          ["Préinscription", `${fee} à régler au formateur, puis à valider dans l'admin`],
        ]),
      ),
      notifyTelegram(
        `<b>Nouvelle inscription</b>\n` +
          `${data.fullName} · ${scheduleLabel}\n` +
          `WhatsApp: ${data.whatsapp}\n` +
          `Email: ${data.email}\n` +
          `Préinscription ${fee} à régler au formateur`,
      ),
    ]);

    return NextResponse.json({ enrollmentId: enrollment.id, redirectTo: THANK_YOU_PAGE });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'inscription." },
      { status: 500 },
    );
  }
}
