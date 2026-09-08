import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      name: "FORGEIA CODE",
      version: "1.0.0",
      downloadUrl: "https://forgeia.guelichweb.store/downloads/forgeia-code-1.0.0.vsix",
      releaseNotes:
        "Version officielle de FORGEIA CODE avec passerelle IA DeepSeek pré-configurée.",
      minVsCodeVersion: "1.84.0",
      updatedAt: "2026-09-08T22:00:00.000Z",
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
