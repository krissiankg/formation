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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateInscription(body);

    if (!parsed.data) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const data = parsed.data;
    const enrollment = await createEnrollment({
      ...data,
      payments: [
        {
          kind: "registration",
          amount: formation.registrationFee,
          status: "pending",
        },
        {
          kind: "start",
          amount: formation.installments[0].amount,
          status: "pending",
        },
        {
          kind: "month1",
          amount: formation.installments[1].amount,
          status: "pending",
        },
        {
          kind: "month3",
          amount: formation.installments[2].amount,
          status: "pending",
        },
      ],
    });

    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "forgeia.guelichweb.store";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const origin = `${proto}://${host}`;
    const callbackUrl = `${origin}/inscription/confirmation?id=${enrollment.id}`;

    const [firstname, ...rest] = data.fullName.trim().split(/\s+/);
    const lastname = rest.join(" ") || firstname;

    const tx = await createFedapayTransaction({
      amount: formation.registrationFee,
      description: `Frais d'inscription — ${formation.title}`,
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
          `Ton inscription pour la cohorte d'octobre 2026 (${scheduleLabel}) est bien enregistrée.\n\n` +
          `👉 *Finalise ta place en réglant les frais d'inscription (${formatFcfa(formation.registrationFee)}) :*\n` +
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
