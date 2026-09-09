import { NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import { updateEnrollmentProfile, getEnrollment } from "@/lib/store/enrollments";
import { getOrCreateStudentWallet } from "@/lib/wallet/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const student = await getSessionEnrollment();
  if (!student) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const fresh = await getEnrollment(student.id);
  if (!fresh) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const wallet = await getOrCreateStudentWallet(student.id);

  return NextResponse.json({
    id: fresh.id,
    fullName: fresh.fullName,
    email: fresh.email,
    whatsapp: fresh.whatsapp,
    schedule: fresh.schedule,
    status: fresh.status,
    avatarUrl: fresh.avatarUrl || null,
    hasPassword: Boolean(fresh.passwordHash),
    balanceCoins: wallet.balanceCoins,
    createdAt: fresh.createdAt,
  });
}

export async function PUT(request: Request) {
  const student = await getSessionEnrollment();
  if (!student) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fullName = typeof body.fullName === "string" ? body.fullName : undefined;
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp : undefined;
    const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl : undefined;
    const password = typeof body.password === "string" ? body.password : undefined;

    if (password && password.trim().length > 0 && password.trim().length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    const updated = await updateEnrollmentProfile(student.id, {
      fullName,
      whatsapp,
      avatarUrl,
      password: password && password.trim().length >= 6 ? password.trim() : undefined,
    });

    const wallet = await getOrCreateStudentWallet(student.id);

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        whatsapp: updated.whatsapp,
        schedule: updated.schedule,
        avatarUrl: updated.avatarUrl || null,
        hasPassword: Boolean(updated.passwordHash),
        balanceCoins: wallet.balanceCoins,
      },
    });
  } catch (err) {
    console.error("[Profile Update Error]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
