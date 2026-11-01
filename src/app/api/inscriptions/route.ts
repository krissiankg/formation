import { NextResponse } from "next/server";
import { validateInscription } from "@/lib/types";
import { createEnrollment, findEnrollmentByEmail, hashPassword } from "@/lib/store/enrollments";
import { formation } from "@/lib/config/formation";
import { createFedapayTransaction, notifyTelegram } from "@/lib/integrations";
import { createSession, getSessionEnrollment } from "@/lib/auth/session";
import { hasRegistrationAccess } from "@/lib/access/registration";
import { notifyAdmin, notifyStudent } from "@/lib/email/notify";
import { accountCreatedEmail, adminAlertEmail } from "@/lib/email/messages";
import { formatFcfa } from "@/lib/format";
import { getPublicOrigin } from "@/lib/http/public-origin";
import { getSeats } from "@/lib/enrollment/seats-server";

const PAYMENT_PAGE = "/inscription/paiement";

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
      // Même apprenant qui renvoie le formulaire (paiement lent ou erreur réseau) : on reprend au paiement.
      const session = await getSessionEnrollment();
      if (session?.id === existing.id && !hasRegistrationAccess(existing)) {
        return NextResponse.json({ enrollmentId: existing.id, paymentUrl: null, redirectTo: PAYMENT_PAGE });
      }
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email. Connecte-toi pour continuer." },
        { status: 409 },
      );
    }

    // 20 places maximum par classe : un créneau complet n'accepte plus de préinscription.
    const seats = await getSeats();
    if (seats[data.schedule].full) {
      return NextResponse.json(
        {
          error: `Le créneau « ${formation.schedule[data.schedule].label} » est complet. Choisis un autre créneau.`,
        },
        { status: 409 },
      );
    }

    const enrollment = await createEnrollment({
      fullName: data.fullName,
      email: data.email,
      whatsapp: data.whatsapp,
      schedule: data.schedule,
      passwordHash: hashPassword(data.password),
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

    // Le compte existe : l'apprenant est connecté et pourra payer plus tard depuis son compte.
    await createSession(enrollment.id);

    const [firstname, ...rest] = data.fullName.trim().split(/\s+/);
    const lastname = rest.join(" ") || firstname;
    const scheduleLabel = formation.schedule[data.schedule]?.label || data.schedule;
    const fee = formatFcfa(formation.registrationFee);

    // Les notifications ne doivent jamais empêcher l'inscription d'aller jusqu'au paiement.
    await Promise.allSettled([
      notifyStudent(enrollment, accountCreatedEmail({ firstname, scheduleLabel, amount: formation.registrationFee })),
      notifyAdmin(
        adminAlertEmail("Nouvelle inscription", [
          ["Nom", data.fullName],
          ["Email", data.email],
          ["WhatsApp", data.whatsapp],
          ["Créneau", scheduleLabel],
          ["Préinscription", `${fee} (en attente de paiement)`],
        ]),
      ),
      notifyTelegram(
        `<b>Inscription démarrée</b>\n` +
          `${data.fullName} · ${scheduleLabel}\n` +
          `WhatsApp: ${data.whatsapp}\n` +
          `Email: ${data.email}\n` +
          `Montant: ${fee}`,
      ),
    ]);

    const origin = getPublicOrigin(request, "www.forgeia.site");
    const callbackUrl = `${origin}${PAYMENT_PAGE}?retour=1`;

    try {
      const tx = await createFedapayTransaction({
        amount: formation.registrationFee,
        description: `Préinscription — ${formation.title}`,
        customer: {
          firstname,
          lastname,
          email: data.email,
          phone: data.whatsapp,
        },
        callbackUrl,
        customMetadata: {
          enrollmentId: enrollment.id,
          kind: "registration",
        },
      });
      const paymentUrl = tx.stub ? `${callbackUrl}&mock_payment=1&tx=${tx.id}` : tx.paymentUrl;
      return NextResponse.json({ enrollmentId: enrollment.id, paymentUrl });
    } catch (paymentError) {
      // FedaPay indisponible : le compte est créé, l'apprenant réessaie depuis la page de paiement.
      console.error("[inscriptions:fedapay]", paymentError);
      return NextResponse.json({ enrollmentId: enrollment.id, paymentUrl: null, redirectTo: PAYMENT_PAGE });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'inscription." },
      { status: 500 },
    );
  }
}
