import { NextResponse } from "next/server";
import { createContent } from "@/lib/store/content";
import { listEnrollments } from "@/lib/store/enrollments";
import { notifyWhatsApp } from "@/lib/integrations";
import { brand } from "@/lib/config/formation";
import type { ContentItem } from "@/lib/store/content";

const kinds = new Set(["outil", "code", "programme", "annonce"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      body?: string;
      kind?: string;
      publish?: boolean;
      notifyWhatsapp?: boolean;
    };

    const title = String(body.title ?? "").trim();
    const text = String(body.body ?? "").trim();
    const kind = String(body.kind ?? "") as ContentItem["kind"];
    const publish = Boolean(body.publish);
    const notifyWhatsapp = Boolean(body.notifyWhatsapp);

    if (title.length < 2 || text.length < 2 || !kinds.has(kind)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const item = await createContent({
      title,
      body: text,
      kind,
      publish,
    });

    if (publish && notifyWhatsapp) {
      const enrollments = await listEnrollments();
      const recipients = enrollments.filter((e) =>
        e.payments.some((p) => p.kind === "registration" && p.status === "paid"),
      );

      await Promise.all(
        recipients.map((e) =>
          notifyWhatsApp(
            e.whatsapp,
            `${brand.name} — Nouveau contenu (${item.kind}) : « ${item.title} ». Connecte-toi à ton espace apprenant pour le découvrir.`,
          ),
        ),
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
