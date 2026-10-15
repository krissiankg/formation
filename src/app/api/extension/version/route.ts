import { NextResponse } from "next/server";
import { FORGEIA_CODE_DOWNLOAD_PATH, FORGEIA_CODE_VERSION } from "@/lib/ia/extension-info";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      name: "FORGEIA CODE",
      id: "guelichweb.forgeia-code",
      version: FORGEIA_CODE_VERSION,
      downloadUrl: `https://forgeia.guelichweb.store${FORGEIA_CODE_DOWNLOAD_PATH}`,
      releaseNotes:
        "FORGEIA CODE 2 : connexion au compte FORGE IA, crédit IA inclus, modes ADAPT et coach, modèles des 3 projets. Propulsé par Kilo Code.",
      minVsCodeVersion: "1.105.0",
      updatedAt: "2026-10-16T00:00:00.000Z",
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
