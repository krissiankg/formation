import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { formatFileSize } from "@/lib/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "resources");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nettoyage et sécurisation du nom de fichier
    const originalName = file.name || "fichier";
    const ext = path.extname(originalName);
    const rawBase = path
      .basename(originalName, ext)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]/g, "_")
      .slice(0, 60);

    const safeBase = rawBase || "document";
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const safeFileName = `${safeBase}_${uniqueId}${ext}`;
    const destinationPath = path.join(uploadDir, safeFileName);

    // Écriture en flux direct (Streaming) pour supporter les gros fichiers sans saturer la RAM
    const webStream = file.stream();
    const nodeReadable = Readable.fromWeb(webStream as any);
    const writeStream = fs.createWriteStream(destinationPath);
    await pipeline(nodeReadable, writeStream);

    const size = file.size;
    const formattedSize = formatFileSize(size);
    const publicUrl = `/uploads/resources/${safeFileName}`;

    return NextResponse.json({
      id: uniqueId,
      name: originalName,
      size,
      formattedSize,
      url: publicUrl,
      type: file.type || "application/octet-stream",
    });
  } catch (err) {
    console.error("[Resource Upload Error]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Échec du téléversement du fichier." },
      { status: 500 }
    );
  }
}
