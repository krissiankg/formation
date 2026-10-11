import { NextResponse } from "next/server";
import { formatFileSize } from "@/lib/format";
import { buildResourceFileName, MAX_RESOURCE_SIZE } from "@/lib/storage/resource-key";
import { createResourceUploadUrl, isS3UploadEnabled } from "@/lib/storage/s3-upload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Prépare un téléversement direct navigateur → S3 (protégé par le middleware /api/admin).
export async function POST(request: Request) {
  if (!isS3UploadEnabled()) {
    return NextResponse.json({ mode: "local" });
  }

  try {
    const body = (await request.json()) as { name?: string; type?: string; size?: number };
    const name = body.name?.trim();
    const size = Number(body.size) || 0;

    if (!name) {
      return NextResponse.json({ error: "Nom de fichier manquant." }, { status: 400 });
    }
    if (size > MAX_RESOURCE_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (500 Mo maximum)." }, { status: 400 });
    }

    const type = body.type || "application/octet-stream";
    const { id, fileName } = buildResourceFileName(name);
    const uploadUrl = await createResourceUploadUrl(fileName, type);

    return NextResponse.json({
      mode: "s3",
      uploadUrl,
      attachment: {
        id,
        name,
        size,
        formattedSize: formatFileSize(size),
        url: `/uploads/resources/${fileName}`,
        type,
      },
    });
  } catch (err) {
    console.error("[Resource Upload URL Error]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Impossible de préparer le téléversement." },
      { status: 500 }
    );
  }
}
