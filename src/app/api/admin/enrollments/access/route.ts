import { NextResponse } from "next/server";
import { getCourseAccess } from "@/lib/access/course-access";
import { setAccessOverride } from "@/lib/store/enrollments";

const OVERRIDES = { auto: null, full: "full", blocked: "blocked" } as const;

export async function POST(request: Request) {
  try {
    const { id, override } = (await request.json()) as { id?: string; override?: string };
    if (!id || !override || !(override in OVERRIDES)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const enrollment = await setAccessOverride(id, OVERRIDES[override as keyof typeof OVERRIDES]);
    return NextResponse.json({ accessOverride: enrollment.accessOverride ?? null, label: getCourseAccess(enrollment).label });
  } catch (error: any) {
    console.error("Erreur POST /api/admin/enrollments/access:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
