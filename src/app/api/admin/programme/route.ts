import { NextResponse } from "next/server";
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  listLessons,
  listModules,
  moveLesson,
  moveModule,
  updateLesson,
  updateModule,
} from "@/lib/store/programme";
import type { LessonType } from "@/lib/programme/types";

export async function GET() {
  try {
    const [modules, lessons] = await Promise.all([listModules(), listLessons()]);
    return NextResponse.json({ modules, lessons });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string;
      monthLabel?: string;
      title?: string;
      moduleId?: string;
      type?: string;
      duration?: string;
      body?: string;
      sortOrder?: number;
      id?: string;
      direction?: number;
    };

    switch (body.action) {
      case "moveModule":
      case "moveLesson": {
        if (!body.id || (body.direction !== 1 && body.direction !== -1)) {
          return NextResponse.json({ error: "ID et direction requis" }, { status: 400 });
        }
        if (body.action === "moveModule") await moveModule(body.id, body.direction);
        else await moveLesson(body.id, body.direction);
        return NextResponse.json({ ok: true });
      }
      case "createModule": {
        if (!body.monthLabel || !body.title) {
          return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
        }
        const mod = await createModule({
          monthLabel: body.monthLabel,
          title: body.title,
          sortOrder: body.sortOrder,
        });
        return NextResponse.json({ module: mod });
      }
      case "createLesson": {
        if (!body.moduleId || !body.title || !body.type || !body.duration) {
          return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
        }
        const lesson = await createLesson({
          moduleId: body.moduleId,
          title: body.title,
          type: body.type as LessonType,
          duration: body.duration,
          body: body.body,
          sortOrder: body.sortOrder,
        });
        return NextResponse.json({ lesson });
      }
      case "updateModule": {
        if (!body.id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
        const mod = await updateModule(body.id, {
          monthLabel: body.monthLabel,
          title: body.title,
          sortOrder: body.sortOrder,
        });
        return NextResponse.json({ module: mod });
      }
      case "updateLesson": {
        if (!body.id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
        const lesson = await updateLesson(body.id, {
          title: body.title,
          type: body.type as LessonType | undefined,
          duration: body.duration,
          body: body.body,
          sortOrder: body.sortOrder,
          moduleId: body.moduleId,
        });
        return NextResponse.json({ lesson });
      }
      case "deleteModule": {
        if (!body.id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
        await deleteModule(body.id);
        return NextResponse.json({ ok: true });
      }
      case "deleteLesson": {
        if (!body.id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
        await deleteLesson(body.id);
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
