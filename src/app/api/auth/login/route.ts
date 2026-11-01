import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { findEnrollmentByEmail, verifyPassword } from "@/lib/store/enrollments";

const WRONG_CREDENTIALS = "Email ou mot de passe incorrect.";

/** Connexion apprenant : email + mot de passe uniquement. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!email) {
      return NextResponse.json({ error: "L'adresse email est requise." }, { status: 400 });
    }

    const enrollment = await findEnrollmentByEmail(email);
    if (enrollment && !enrollment.passwordHash) {
      // Inscrit avant le passage aux mots de passe : il le crée par « mot de passe oublié ».
      return NextResponse.json(
        {
          error: "Ton compte n'a pas encore de mot de passe. Clique sur « Mot de passe oublié » pour le créer.",
          needsPassword: true,
        },
        { status: 401 },
      );
    }

    if (!enrollment?.passwordHash || !password || !verifyPassword(password, enrollment.passwordHash)) {
      return NextResponse.json({ error: WRONG_CREDENTIALS }, { status: 401 });
    }

    await createSession(enrollment.id);
    return NextResponse.json({ ok: true, redirectTo: "/espace" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur lors de la connexion." }, { status: 500 });
  }
}
