import { NextResponse } from "next/server";
import { formation } from "@/lib/config/formation";
import { notifyStudent } from "@/lib/email/notify";
import { paymentReceivedEmail, registrationConfirmedEmail } from "@/lib/email/messages";
import { getWhatsAppGroupUrl } from "@/lib/settings/whatsapp-group";
import { getInstallmentLabel, MANUAL_PAYMENT_REF } from "@/lib/programme/installments";
import {
  getEnrollment,
  markPaymentPaid,
  revertManualPayment,
} from "@/lib/store/enrollments";
import type { PaymentKind } from "@/lib/types";

const KINDS: PaymentKind[] = ["registration", "start", "month1", "month3"];

/** Marque une échéance comme payée à la main (ou annule ce marquage). Route protégée par le proxy admin (src/proxy.ts). */
export async function POST(request: Request) {
  try {
    const { id, kind, paid } = (await request.json()) as { id?: string; kind?: PaymentKind; paid?: boolean };
    if (!id || !kind || !KINDS.includes(kind) || typeof paid !== "boolean") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const enrollment = await getEnrollment(id);
    const target = enrollment?.payments.find((p) => p.kind === kind);
    if (!enrollment || !target) {
      return NextResponse.json({ error: "Échéance introuvable" }, { status: 404 });
    }

    if (!paid) {
      if (target.status !== "paid" || target.fedapayId !== MANUAL_PAYMENT_REF) {
        return NextResponse.json(
          { error: "Seul un paiement marqué à la main peut être annulé (les paiements FedaPay restent acquis)." },
          { status: 409 },
        );
      }
      await revertManualPayment(id, kind);
      return NextResponse.json({ ok: true });
    }

    if (target.status === "paid") {
      return NextResponse.json({ ok: true, already: true });
    }

    await markPaymentPaid(id, kind, MANUAL_PAYMENT_REF);

    const firstname = enrollment.fullName.trim().split(/\s+/)[0] ?? "";
    await notifyStudent(
      enrollment,
      kind === "registration"
        ? registrationConfirmedEmail({
            firstname,
            scheduleLabel: formation.schedule[enrollment.schedule].label,
            groupUrl: await getWhatsAppGroupUrl(),
          })
        : paymentReceivedEmail({ firstname, label: getInstallmentLabel(kind), amount: target.amount, kind }),
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/enrollments/payment:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
