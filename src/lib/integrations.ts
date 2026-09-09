/**
 * Intégrations externes (Telegram, WhatsApp, FedaPay).
 * WhatsApp : Evolution API (recommandé) ou Meta Cloud API.
 */

import { contact } from "@/lib/config/formation";

/** Numéro WhatsApp au format international sans + (ex. 22966368705). */
export function formatWhatsAppDigits(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 8) return `229${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `229${digits.slice(1)}`;
  return digits;
}

export async function notifyTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.info("[telegram:stub]", message);
    return { ok: true, stub: true };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[telegram:error]", body);
    return { ok: false, stub: false };
  }

  return { ok: true, stub: false };
}

async function sendViaEvolutionApi(to: string, message: string) {
  const baseUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
  const instance = process.env.EVOLUTION_API_INSTANCE;
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!baseUrl || !instance || !apiKey) {
    return null;
  }

  const res = await fetch(`${baseUrl}/message/sendText/${instance}`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      number: formatWhatsAppDigits(to),
      text: message,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Evolution API: ${body}`);
  }

  return { ok: true, stub: false, provider: "evolution" as const };
}

async function sendViaMetaCloudApi(to: string, message: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return null;
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formatWhatsAppDigits(to),
        type: "text",
        text: { body: message },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta WhatsApp: ${body}`);
  }

  return { ok: true, stub: false, provider: "meta" as const };
}

/** Envoie un WhatsApp à un apprenant ou contact. */
export async function notifyWhatsApp(to: string, message: string) {
  try {
    const evolution = await sendViaEvolutionApi(to, message);
    if (evolution) return evolution;

    const meta = await sendViaMetaCloudApi(to, message);
    if (meta) return meta;

    console.info("[whatsapp:stub]", {
      to: formatWhatsAppDigits(to),
      message,
    });
    return { ok: true, stub: true };
  } catch (error) {
    console.error("[whatsapp:error]", error);
    return { ok: false, stub: false };
  }
}

/** Notification WhatsApp pour toi (admin) — nouveau paiement, etc. */
export async function notifyAdminWhatsApp(message: string) {
  const admin =
    process.env.ADMIN_WHATSAPP?.trim() || contact.whatsappDigits;
  return notifyWhatsApp(admin, message);
}

function parseFedapayPhone(phone?: string): { number: string; country: string } | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  // Bénin : 229XXXXXXXX ou 8 chiffres
  if (digits.startsWith("229") && digits.length >= 11) {
    return { number: digits.slice(3), country: "bj" };
  }
  if (digits.length === 8) {
    return { number: digits, country: "bj" };
  }
  // Côte d'Ivoire : 225XXXXXXXXXX ou 10 chiffres
  if (digits.startsWith("225") && digits.length >= 12) {
    return { number: digits.slice(3), country: "ci" };
  }
  if (digits.length === 10) {
    return { number: digits, country: "ci" };
  }
  // Togo : 228XXXXXXXX ou 8 chiffres
  if (digits.startsWith("228") && digits.length >= 10) {
    return { number: digits.slice(3), country: "tg" };
  }
  // Sénégal : 221XXXXXXXXX ou 9 chiffres
  if (digits.startsWith("221") && digits.length >= 11) {
    return { number: digits.slice(3), country: "sn" };
  }

  // Par défaut, retourner le numéro avec indicatif béninois (bj)
  return { number: digits, country: "bj" };
}

async function getOrCreateFedapayCustomerId(
  base: string,
  secret: string,
  customer: { firstname: string; lastname: string; email: string; phone?: string }
): Promise<number | null> {
  // 1. Chercher si le client existe déjà par son email pour éviter l'erreur "email n'est pas disponible"
  try {
    const searchRes = await fetch(
      `${base}/v1/customers?search[email]=${encodeURIComponent(customer.email)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
      }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const list = searchData["v1/customers"] ?? searchData.customers ?? [];
      if (Array.isArray(list) && list.length > 0 && list[0].id) {
        return Number(list[0].id);
      }
    }
  } catch (err) {
    console.warn("[FedaPay] Recherche client:", err);
  }

  // 2. Si pas trouvé, tenter de le créer proprement avec son numéro
  try {
    const phoneObj = parseFedapayPhone(customer.phone);
    const createRes = await fetch(`${base}/v1/customers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstname: customer.firstname || "Apprenant",
        lastname: customer.lastname || "FORGEIA",
        email: customer.email,
        ...(phoneObj ? { phone_number: phoneObj } : {}),
      }),
    });

    if (createRes.ok) {
      const createData = await createRes.json();
      const created = createData["v1/customer"] ?? createData.customer;
      if (created?.id) return Number(created.id);
    }
  } catch (err) {
    console.warn("[FedaPay] Création client:", err);
  }

  return null;
}

/**
 * FedaPay — création de transaction.
 * En sandbox sans clés, on simule une URL de paiement locale.
 */
export async function createFedapayTransaction(input: {
  amount: number;
  description: string;
  customer: { firstname: string; lastname: string; email: string; phone: string };
  callbackUrl: string;
  customMetadata?: Record<string, string>;
}) {
  const secret = process.env.FEDAPAY_SECRET_KEY;
  const env = process.env.FEDAPAY_ENV ?? "sandbox";

  if (!secret) {
    const mockId = `mock_${crypto.randomUUID()}`;
    return {
      id: mockId,
      stub: true as const,
      paymentUrl: `${input.callbackUrl}?mock_payment=1&tx=${mockId}`,
    };
  }

  const base =
    env === "live" ? "https://api.fedapay.com" : "https://sandbox-api.fedapay.com";

  const customerId = await getOrCreateFedapayCustomerId(base, secret, input.customer);

  const payload: Record<string, unknown> = {
    description: input.description,
    amount: input.amount,
    currency: { iso: "XOF" },
    callback_url: input.callbackUrl,
    custom_metadata: input.customMetadata,
  };

  if (customerId) {
    payload.customer_id = customerId;
  } else {
    const phoneObj = parseFedapayPhone(input.customer.phone);
    payload.customer = {
      firstname: input.customer.firstname || "Apprenant",
      lastname: input.customer.lastname || "FORGEIA",
      email: input.customer.email,
      ...(phoneObj ? { phone_number: phoneObj } : {}),
    };
  }

  const res = await fetch(`${base}/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FedaPay error: ${body}`);
  }

  const raw = (await res.json()) as Record<string, any>;
  const txObj = raw["v1/transaction"] ?? raw.transaction ?? raw.v1 ?? raw;

  const id = String(txObj.id ?? raw.id ?? "");
  const paymentUrl = String(
    txObj.payment_url ??
      txObj.url ??
      raw.payment_url ??
      ""
  );

  if (!paymentUrl) {
    throw new Error(`FedaPay: URL de paiement introuvable dans la réponse (${JSON.stringify(raw)})`);
  }

  return { id, paymentUrl, stub: false as const };
}

