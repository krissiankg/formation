import { NextResponse } from "next/server";
import { createContent, deleteContent, type ContentItem, type ContentAttachment } from "@/lib/store/content";
import { listEnrollments } from "@/lib/store/enrollments";
import { notifyWhatsApp } from "@/lib/integrations";
import { brand } from "@/lib/config/formation";

const kinds = new Set(["outil", "code", "programme", "annonce"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      body?: string;
      kind?: string;
      publish?: boolean;
      notifyWhatsapp?: boolean;
      attachments?: ContentAttachment[];
    };

    const title = String(body.title ?? "").trim();
    const text = String(body.body ?? "").trim();
    const kind = String(body.kind ?? "") as ContentItem["kind"];
    const publish = Boolean(body.publish);
    const notifyWhatsapp = Boolean(body.notifyWhatsapp);
    const attachments = Array.isArray(body.attachments) ? body.attachments : [];

    if (title.length < 2 || text.length < 2 || !kinds.has(kind)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const item = await createContent({
      title,
      body: text,
      kind,
      publish,
      attachments,
    });

    if (publish && notifyWhatsapp) {
      const enrollments = await listEnrollments();
      const recipients = enrollments.filter((e) =>
        e.payments.some((p) => p.kind === "registration" && p.status === "paid"),
      );

      const attachNote = attachments.length > 0 ? ` (${attachments.length} pièce${attachments.length > 1 ? "s" : ""} jointe${attachments.length > 1 ? "s" : ""})` : "";

      await Promise.all(
        recipients.map((e) =>
          notifyWhatsApp(
            e.whatsapp,
            `${brand.name} — Nouveau contenu (${item.kind}) : « ${item.title} »${attachNote}. Connecte-toi à ton espace apprenant pour le découvrir.`,
          ),
        ),
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("[Content Create Error]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    await deleteContent(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Content Delete Error]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
