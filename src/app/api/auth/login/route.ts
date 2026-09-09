import { NextResponse } from "next/server";
import {
  createSession,
  findEnrollmentByCredentials,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      whatsapp?: string;
      password?: string;
    };

    const email = String(body.email ?? "").trim();
    const whatsapp = String(body.whatsapp ?? "").trim();
    const password = String(body.password ?? "").trim();

    if (!email) {
      return NextResponse.json(
        { error: "L'adresse email est requise." },
        { status: 400 },
      );
    }

    const { findEnrollmentByEmail, verifyPassword } = await import("@/lib/store/enrollments");

    let enrollment = null;

    // Tentative de connexion par mot de passe
    if (password) {
      const found = await findEnrollmentByEmail(email);
      if (found && found.passwordHash && verifyPassword(password, found.passwordHash)) {
        enrollment = found;
      } else if (!whatsapp) {
        return NextResponse.json(
          { error: "Mot de passe incorrect ou compte introuvable." },
          { status: 401 },
        );
      }
    }

    // Si pas connecté par mot de passe, vérifier via WhatsApp
    if (!enrollment && whatsapp) {
      enrollment = await findEnrollmentByCredentials(email, whatsapp);
    }

    if (!enrollment) {
      return NextResponse.json(
        {
          error:
            "Aucun compte trouvé. Vérifie ton email et ton WhatsApp ou mot de passe, ou inscris-toi d'abord.",
        },
        { status: 401 },
      );
    }

    await createSession(enrollment.id);

    return NextResponse.json({
      ok: true,
      enrollmentId: enrollment.id,
      fullName: enrollment.fullName,
      redirectTo: "/espace",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la connexion." },
      { status: 500 },
    );
  }
}
