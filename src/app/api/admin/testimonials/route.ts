import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/auth/admin-session";
import {
  listAllTestimonials,
  updateTestimonialStatus,
  deleteTestimonial,
} from "@/lib/testimonials/store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || !verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const testimonials = await listAllTestimonials();
    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Erreur liste avis admin:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || !verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const updated = await updateTestimonialStatus(id, status);
    return NextResponse.json({ success: true, testimonial: updated });
  } catch (error) {
    console.error("Erreur mise à jour avis:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token || !verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    await deleteTestimonial(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression avis:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
