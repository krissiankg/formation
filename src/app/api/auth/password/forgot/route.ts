import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { notifyStudent } from "@/lib/email/notify";
import { passwordLinkEmail } from "@/lib/email/messages";
import { siteOrigin } from "@/lib/config/site";
import { findEnrollmentByEmail } from "@/lib/store/enrollments";

const COOLDOWN_MS = 60_000;
// Un email par adresse et par minute (par conteneur) : protège le quota Brevo de 300 emails par jour.
const lastSentAt = new Map<string, number>();

/** Envoie un lien de (re)création du mot de passe. Même réponse que le compte existe ou non. */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) return NextResponse.json({ ok: true });

    const now = Date.now();
    if (now - (lastSentAt.get(email) ?? 0) < COOLDOWN_MS) return NextResponse.json({ ok: true });

    const enrollment = await findEnrollmentByEmail(email);
    if (!enrollment) return NextResponse.json({ ok: true });

    lastSentAt.set(email, now);
    const token = createPasswordResetToken(enrollment);
    const firstname = enrollment.fullName.trim().split(/\s+/)[0] ?? "";
    await notifyStudent(
      enrollment,
      passwordLinkEmail({
        firstname,
        url: `${siteOrigin}/mot-de-passe/nouveau?token=${encodeURIComponent(token)}`,
        purpose: enrollment.passwordHash ? "reset" : "setup",
      }),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[auth:forgot]", error);
    return NextResponse.json({ ok: true });
  }
}
