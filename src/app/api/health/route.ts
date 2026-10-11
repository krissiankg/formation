import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Contrôle de santé utilisé par l'ALB / ECS (ne touche pas la base).
export function GET() {
  return NextResponse.json({ ok: true });
}
