/**
 * Envoi d'emails transactionnels par Brevo.
 * Ne lève jamais d'erreur : un email raté ne doit pas bloquer une inscription ou un paiement.
 */

export type EmailMessage = { subject: string; html: string; text: string };

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const DEFAULT_FROM = "FORGE IA <notifications@forgeia.site>";
const TIMEOUT_MS = 8000;

function parseSender(value: string) {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1] || "FORGE IA", email: match[2].trim() };
  return { name: "FORGE IA", email: value.trim() };
}

export async function sendEmail(
  to: { email: string; name?: string },
  message: EmailMessage,
): Promise<{ ok: boolean; stub: boolean }> {
  const email = to.email.trim().toLowerCase();
  // Comptes de test : aucune adresse réelle derrière.
  if (email.endsWith("@forgeia.local")) return { ok: true, stub: true };

  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    console.info("[email:stub]", { to: email, subject: message.subject });
    return { ok: true, stub: true };
  }

  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: parseSender(process.env.EMAIL_FROM || DEFAULT_FROM),
        to: [to.name ? { email, name: to.name } : { email }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("[email:error]", res.status, await res.text());
      return { ok: false, stub: false };
    }
    return { ok: true, stub: false };
  } catch (error) {
    console.error("[email:error]", error);
    return { ok: false, stub: false };
  }
}
