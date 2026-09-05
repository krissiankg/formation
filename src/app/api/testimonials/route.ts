import { NextRequest, NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import { createTestimonial, getStudentTestimonial } from "@/lib/testimonials/store";

export async function GET() {
  try {
    const enrollment = await getSessionEnrollment();
    if (!enrollment) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const testimonial = await getStudentTestimonial(enrollment.id);
    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error("Erreur récupération témoignage:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const enrollment = await getSessionEnrollment();
    if (!enrollment) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { rating, content, roleOrProject } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Une note entre 1 et 5 est requise" }, { status: 400 });
    }

    if (!content || typeof content !== "string" || content.trim().length < 10) {
      return NextResponse.json({ error: "Le témoignage doit contenir au moins 10 caractères" }, { status: 400 });
    }

    const testimonial = await createTestimonial({
      enrollmentId: enrollment.id,
      rating,
      content,
      roleOrProject,
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    console.error("Erreur création avis:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
