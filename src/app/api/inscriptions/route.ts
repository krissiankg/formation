import { NextResponse } from "next/server";
import { validateInscription } from "@/lib/types";
import { createEnrollment } from "@/lib/store/enrollments";
import { formation } from "@/lib/config/formation";
import {
  createFedapayTransaction,
  notifyTelegram,
  notifyWhatsApp,
  notifyAdminWhatsApp,
} from "@/lib/integrations";
import { formatFcfa } from "@/lib/format";
import { getPublicOrigin } from "@/lib/http/public-origin";
import { getSeats } from "@/lib/enrollment/seats-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateInscription(body);

    if (!parsed.data) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const data = parsed.data;

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
      ...data,
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

    const origin = getPublicOrigin(request, "www.forgeia.site");
    const callbackUrl = `${origin}/inscription/confirmation?id=${enrollment.id}`;

    const [firstname, ...rest] = data.fullName.trim().split(/\s+/);
    const lastname = rest.join(" ") || firstname;

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

    const scheduleLabel =
      formation.schedule[data.schedule]?.label || data.schedule;

    await notifyTelegram(
      `<b>Inscription démarrée</b>\n` +
        `${data.fullName} · ${scheduleLabel}\n` +
        `WhatsApp: ${data.whatsapp}\n` +
        `Montant: ${formatFcfa(formation.registrationFee)}\n` +
        `Mode: ${tx.stub ? "démo (sans clé FedaPay)" : "FedaPay"}`,
    );

    const paymentUrl = tx.stub
      ? `${callbackUrl}&mock_payment=1&tx=${tx.id}`
      : tx.paymentUrl;

    // Envoi WhatsApp immédiat de confirmation à l'apprenant
    try {
      await notifyWhatsApp(
        data.whatsapp,
        `*Bienvenue sur FORGEIA, ${firstname} !*\n\n` +
          `Ta préinscription pour la cohorte de novembre 2026 (${scheduleLabel}) est bien enregistrée.\n\n` +
          `👉 *Réserve ta place en réglant ta préinscription (${formatFcfa(formation.registrationFee)}) :*\n` +
          `${paymentUrl}\n\n` +
          `Une fois ton paiement validé, ton espace apprenant sera débloqué immédiatement.\n\n` +
          `_L'équipe FORGEIA_`,
      );
    } catch (waErr) {
      console.error("[inscriptions:whatsapp:student:error]", waErr);
    }

    // Envoi WhatsApp d'alerte à l'administrateur
    try {
      await notifyAdminWhatsApp(
        `🚀 *FORGEIA — Nouvelle inscription démarrée*\n\n` +
          `👤 *Nom :* ${data.fullName}\n` +
          `📱 *WhatsApp :* ${data.whatsapp}\n` +
          `📅 *Créneau :* ${scheduleLabel}\n` +
          `✉️ *Email :* ${data.email}\n` +
          `💰 *Montant :* ${formatFcfa(formation.registrationFee)}`,
      );
    } catch (waAdminErr) {
      console.error("[inscriptions:whatsapp:admin:error]", waAdminErr);
    }

    return NextResponse.json({
      enrollmentId: enrollment.id,
      paymentUrl,
      stub: tx.stub,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'inscription." },
      { status: 500 },
    );
  }
}
