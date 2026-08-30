import { NextResponse } from "next/server";
import {
  createSession,
  deleteSession,
  listSessions,
  updateSession,
} from "@/lib/store/sessions";

export async function GET() {
  try {
    const sessions = await listSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string;
      id?: string;
      title?: string;
      sessionDate?: string;
      hours?: string;
      location?: string;
      schedule?: string;
      lessonId?: string | null;
    };

    switch (body.action) {
      case "create": {
        if (!body.title || !body.sessionDate || !body.hours || !body.location || !body.schedule) {
          return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
        }
        const session = await createSession({
          title: body.title,
          sessionDate: body.sessionDate,
          hours: body.hours,
          location: body.location,
          schedule: body.schedule as "saturday" | "sunday" | "both",
          lessonId: body.lessonId,
        });
        return NextResponse.json({ session });
      }
      case "update": {
        if (!body.id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
        const session = await updateSession(body.id, {
          title: body.title,
          sessionDate: body.sessionDate,
          hours: body.hours,
          location: body.location,
          schedule: body.schedule as "saturday" | "sunday" | "both" | undefined,
          lessonId: body.lessonId,
        });
        return NextResponse.json({ session });
      }
      case "delete": {
        if (!body.id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
        await deleteSession(body.id);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
