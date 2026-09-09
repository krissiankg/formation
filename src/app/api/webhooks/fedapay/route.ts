import { NextResponse } from "next/server";
import { markRegistrationPaid, markPaymentPaid, getEnrollment } from "@/lib/store/enrollments";
import { notifyTelegram, notifyWhatsApp, notifyAdminWhatsApp } from "@/lib/integrations";
import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import { verifyFedapayWebhook } from "@/lib/fedapay/webhook";
import type { PaymentKind } from "@/lib/types";

export const runtime = "nodejs";

const installmentLabels: Record<string, string> = {
  registration: "Frais d'inscription",
  start: "Tranche 1 (Démarrage)",
  month1: "Tranche 2 (Fin 1er mois)",
  month3: "Tranche 3 (Début 3e mois - Solde)",
};

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
    const kind = (metadata.kind as PaymentKind) || "registration";
    const txId = String(entity.id ?? "");
    const amount = Number(entity.amount ?? 0);

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

    // Gestion de l'achat de Coins pour les templates UI8
    if (metadata.type === "coins_purchase") {
      const { creditCoins } = await import("@/lib/wallet/store");
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin");

      const student = await getEnrollment(enrollmentId);
      if (!student) {
        return NextResponse.json({ error: "student_not_found" }, { status: 404 });
      }

      const coins = Number(metadata.coins ?? 0);
      if (coins <= 0) {
        return NextResponse.json({ error: "invalid_coins_amount" }, { status: 400 });
      }

      // Idempotence : vérifier si cette transaction a déjà été créditée
      const supabase = getSupabaseAdmin();
      const { data: existingTx } = await supabase
        .from("coin_transactions")
        .select("id")
        .eq("reference_id", txId)
        .maybeSingle();

      if (existingTx) {
        return NextResponse.json({ ok: true, already: true });
      }

      const formattedAmount = amount > 0 ? formatFcfa(amount) : `${coins} coins`;

      await creditCoins(
        enrollmentId,
        coins,
        "fedapay_purchase",
        `Achat de pack (${coins} coins - ${formattedAmount})`,
        txId
      );

      await notifyTelegram(
        `<b>Recharge de Coins (FedaPay)</b>\n` +
          `Coins crédités: +${coins} 🪙\n` +
          `Apprenant: ${student.fullName}\n` +
          `Email: ${student.email}\n` +
          `WhatsApp: ${student.whatsapp}\n` +
          `Montant: ${formattedAmount} · tx ${txId}`
      );

      await notifyAdminWhatsApp(
        `FORGE IA — Recharge Coins reçue\n` +
          `Coins: +${coins} 🪙\n` +
          `Apprenant: ${student.fullName}\n` +
          `Montant: ${formattedAmount}`
      );

      if (student.whatsapp) {
        await notifyWhatsApp(
          student.whatsapp,
          `FORGE IA : Ton portefeuille a bien été rechargé de +${coins} coins (Montant: ${formattedAmount}). Tu peux dès maintenant débloquer tes templates UI8 sur ton espace ressources !`
        );
      }

      return NextResponse.json({ ok: true, coinsCredited: coins });
    }

    const existing = await getEnrollment(enrollmentId);
    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Vérifier si la tranche spécifique a déjà été payée
    const targetPayment = existing.payments.find((p) => p.kind === kind);
    if (targetPayment?.status === "paid") {
      return NextResponse.json({ ok: true, already: true });
    }

    const enrollment =
      kind === "registration"
        ? await markRegistrationPaid(enrollmentId, txId)
        : await markPaymentPaid(enrollmentId, kind, txId);

    if (!enrollment) {
      return NextResponse.json({ error: "update_failed" }, { status: 500 });
    }

    const trancheLabel = installmentLabels[kind] || kind;
    const formattedAmount = amount > 0 ? formatFcfa(amount) : formatFcfa(targetPayment?.amount || 0);

    await notifyTelegram(
      `<b>Paiement confirmé (FedaPay)</b>\n` +
        `Type: ${trancheLabel}\n` +
        `Nom: ${enrollment.fullName}\n` +
        `Email: ${enrollment.email}\n` +
        `WhatsApp: ${enrollment.whatsapp}\n` +
        `Créneau: ${formation.schedule[enrollment.schedule].label}\n` +
        `Montant: ${formattedAmount} · tx ${txId}`,
    );

    await notifyAdminWhatsApp(
      `FORGE IA — Nouveau paiement reçu\n` +
        `Tranche: ${trancheLabel}\n` +
        `Nom: ${enrollment.fullName}\n` +
        `WhatsApp: ${enrollment.whatsapp}\n` +
        `Montant: ${formattedAmount}`,
    );

    await notifyWhatsApp(
      enrollment.whatsapp,
      `Paiement reçu (${trancheLabel} : ${formattedAmount}) — merci ! Ton échéancier a été mis à jour dans ton espace apprenant.`,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[fedapay:webhook]", error);
    return NextResponse.json({ error: "webhook_error" }, { status: 500 });
  }
}
