import { NextResponse } from "next/server";
import { createTodo, deleteTodo, listTodos, updateTodo } from "@/lib/store/todos";

export async function GET() {
  try {
    const todos = await listTodos();
    return NextResponse.json({ todos });
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
      sortOrder?: number;
      active?: boolean;
    };

    switch (body.action) {
      case "create": {
        if (!body.title) {
          return NextResponse.json({ error: "Titre requis" }, { status: 400 });
        }
        const todo = await createTodo({ title: body.title, sortOrder: body.sortOrder });
        return NextResponse.json({ todo });
      }
      case "update": {
        if (!body.id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
        const todo = await updateTodo(body.id, {
          title: body.title,
          sortOrder: body.sortOrder,
          active: body.active,
        });
        return NextResponse.json({ todo });
      }
      case "delete": {
        if (!body.id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
        await deleteTodo(body.id);
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
