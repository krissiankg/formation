import { NextResponse } from "next/server";
import { validateInscription } from "@/lib/types";
import { createEnrollment } from "@/lib/store/enrollments";
import { formation } from "@/lib/config/formation";
import { createFedapayTransaction, notifyTelegram } from "@/lib/integrations";
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

    const origin = new URL(request.url).origin;
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

    await notifyTelegram(
      `<b>Inscription démarrée</b>\n` +
        `${data.fullName} · ${formation.schedule[data.schedule].label}\n` +
        `WhatsApp: ${data.whatsapp}\n` +
        `Montant: ${formatFcfa(formation.registrationFee)}\n` +
        `Mode: ${tx.stub ? "démo (sans clé FedaPay)" : "FedaPay"}`,
    );

    const paymentUrl = tx.stub
      ? `${callbackUrl}&mock_payment=1&tx=${tx.id}`
      : tx.paymentUrl;

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
