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
    };

    const email = String(body.email ?? "").trim();
    const whatsapp = String(body.whatsapp ?? "").trim();

    if (!email || !whatsapp) {
      return NextResponse.json(
        { error: "Email et numéro WhatsApp requis." },
        { status: 400 },
      );
    }

    const enrollment = await findEnrollmentByCredentials(email, whatsapp);
    if (!enrollment) {
      return NextResponse.json(
        {
          error:
            "Aucun compte trouvé. Vérifie ton email et ton WhatsApp, ou inscris-toi d'abord.",
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
