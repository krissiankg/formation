import { Webhook } from "fedapay";

export type FedapayWebhookEvent = {
  name?: string;
  entity?: Record<string, unknown>;
  data?: { object?: Record<string, unknown> };
};

export function verifyFedapayWebhook(
  rawBody: string,
  signature: string | null,
): FedapayWebhookEvent {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;

  if (!secret) {
    return JSON.parse(rawBody) as FedapayWebhookEvent;
  }

  if (!signature) {
    throw new Error("Signature FedaPay manquante.");
  }

  return Webhook.constructEvent(
    rawBody,
    signature,
    secret,
  ) as FedapayWebhookEvent;
}
