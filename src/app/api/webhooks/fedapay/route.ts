import { NextResponse } from "next/server";
import { markRegistrationPaid, getEnrollment } from "@/lib/store/enrollments";
import { notifyTelegram, notifyWhatsApp, notifyAdminWhatsApp } from "@/lib/integrations";
import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import { verifyFedapayWebhook } from "@/lib/fedapay/webhook";

export const runtime = "nodejs";

/**
 * Webhook FedaPay — URL : https://forgeia.guelichweb.store/api/webhooks/fedapay
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-fedapay-signature");

    let payload: ReturnType<typeof verifyFedapayWebhook>;
    try {
      payload = verifyFedapayWebhook(rawBody, signature);
    } catch (error) {
      console.error("[fedapay:webhook:signature]", error);
      return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
    }

    const eventName = payload?.name ?? "";
    const entity = (payload?.entity ??
      payload?.data?.object ??
      {}) as Record<string, unknown>;

    const metadata = (entity.custom_metadata ??
      entity.metadata ??
      {}) as Record<string, string>;

    const enrollmentId = metadata.enrollmentId ?? null;
    const txId = String(entity.id ?? "");

    if (!enrollmentId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const approved =
      eventName === "transaction.approved" ||
      entity.status === "approved" ||
      entity.status === "transferred";

    if (!approved) {
      return NextResponse.json({ ok: true, pending: true });
    }

    const existing = await getEnrollment(enrollmentId);
    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (existing.status === "registered" || existing.status === "active") {
      return NextResponse.json({ ok: true, already: true });
    }

    const enrollment = await markRegistrationPaid(enrollmentId, txId);
    if (!enrollment) {
      return NextResponse.json({ error: "update_failed" }, { status: 500 });
    }

    await notifyTelegram(
      `<b>Paiement confirmé (FedaPay)</b>\n` +
        `${enrollment.fullName}\n` +
        `${enrollment.email}\n` +
        `WhatsApp: ${enrollment.whatsapp}\n` +
        `${formation.schedule[enrollment.schedule].label}\n` +
        `${formatFcfa(formation.registrationFee)} · tx ${txId}`,
    );

    await notifyAdminWhatsApp(
      `FORGE IA — Nouvelle inscription payée\n` +
        `Nom: ${enrollment.fullName}\n` +
        `Email: ${enrollment.email}\n` +
        `WhatsApp: ${enrollment.whatsapp}\n` +
        `Créneau: ${formation.schedule[enrollment.schedule].label}\n` +
        `Montant: ${formatFcfa(formation.registrationFee)}`,
    );

    await notifyWhatsApp(
      enrollment.whatsapp,
      `Paiement reçu — bienvenue dans ${formation.title}. Connecte-toi à ton espace apprenant pour démarrer.`,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[fedapay:webhook]", error);
    return NextResponse.json({ error: "webhook_error" }, { status: 500 });
  }
}
