import { NextResponse } from "next/server";
import { passwordFingerprint, readPasswordResetToken } from "@/lib/auth/password-reset";
import { createSession } from "@/lib/auth/session";
import { getEnrollment, updateEnrollmentProfile } from "@/lib/store/enrollments";
import { passwordError } from "@/lib/types";

const EXPIRED_LINK = "Ce lien n'est plus valable. Demande un nouveau lien.";

/** Enregistre le nouveau mot de passe choisi depuis le lien reçu par email, puis connecte l'apprenant. */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      token?: unknown;
      password?: unknown;
      passwordConfirm?: unknown;
    };
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirm = typeof body.passwordConfirm === "string" ? body.passwordConfirm : "";

    const claims = readPasswordResetToken(token);
    if (!claims) return NextResponse.json({ error: EXPIRED_LINK }, { status: 400 });

    const badPassword = passwordError(password, confirm);
    if (badPassword) return NextResponse.json({ error: badPassword }, { status: 400 });

    const enrollment = await getEnrollment(claims.enrollmentId);
    // Le lien ne sert qu'une fois : il devient invalide dès que le mot de passe a changé.
    if (!enrollment || passwordFingerprint(enrollment.passwordHash) !== claims.fingerprint) {
      return NextResponse.json({ error: EXPIRED_LINK }, { status: 400 });
    }

    await updateEnrollmentProfile(enrollment.id, { password });
    await createSession(enrollment.id);
    return NextResponse.json({ redirectTo: "/espace" });
  } catch (error) {
    console.error("[auth:reset]", error);
    return NextResponse.json({ error: "Erreur serveur. Réessaie dans un instant." }, { status: 500 });
  }
}
