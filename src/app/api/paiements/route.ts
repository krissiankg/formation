import { NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import { getEnrollment } from "@/lib/store/enrollments";
import { formation } from "@/lib/config/formation";
import { createFedapayTransaction } from "@/lib/integrations";
import type { PaymentKind } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const sessionEnrollment = await getSessionEnrollment();
    if (!sessionEnrollment) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = (await request.json()) as { kind?: PaymentKind };
    const kind = body.kind;

    if (!kind || !["start", "month1", "month3"].includes(kind)) {
      return NextResponse.json({ error: "Tranche invalide" }, { status: 400 });
    }

    const enrollment = await getEnrollment(sessionEnrollment.id);
    if (!enrollment) {
      return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
    }

    const paymentEntry = enrollment.payments.find((p) => p.kind === kind);
    if (!paymentEntry) {
      return NextResponse.json({ error: "Échéance introuvable" }, { status: 404 });
    }

    if (paymentEntry.status === "paid") {
      return NextResponse.json({ error: "Cette tranche a déjà été réglée." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const callbackUrl = `${origin}/espace/paiements?status=success&kind=${kind}`;

    const [firstname, ...rest] = enrollment.fullName.trim().split(/\s+/);
    const lastname = rest.join(" ") || firstname;

    const installmentConfig = formation.installments.find(
      (inst) => (inst.id === "start" && kind === "start") ||
                (inst.id === "month1" && kind === "month1") ||
                (inst.id === "month3" && kind === "month3")
    );

    const description = `${installmentConfig?.label || kind} — ${formation.title}`;

    const tx = await createFedapayTransaction({
      amount: paymentEntry.amount,
      description,
      customer: {
        firstname,
        lastname,
        email: enrollment.email,
        phone: enrollment.whatsapp,
      },
      callbackUrl,
      customMetadata: {
        enrollmentId: enrollment.id,
        kind,
      },
    });

    const paymentUrl = tx.stub
      ? `${callbackUrl}&mock_payment=1&tx=${tx.id}`
      : tx.paymentUrl;

    return NextResponse.json({ paymentUrl, stub: tx.stub });
  } catch (error) {
    console.error("[api/paiements:error]", error);
    return NextResponse.json({ error: "Erreur lors de l'initialisation du paiement." }, { status: 500 });
  }
}
