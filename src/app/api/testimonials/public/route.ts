import { NextResponse } from "next/server";
import { listApprovedTestimonials } from "@/lib/testimonials/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await listApprovedTestimonials();
    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Erreur avis publics:", error);
    return NextResponse.json({ testimonials: [] });
  }
}
