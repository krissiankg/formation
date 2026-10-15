import { NextResponse } from "next/server";
import { getCourseAccess } from "@/lib/access/course-access";
import { getSessionEnrollment } from "@/lib/auth/session";
import { forgeiaCodeConnectUrl } from "@/lib/ia/extension-info";
import { createIaLinkToken } from "@/lib/ia/link-token";

export const dynamic = "force-dynamic";

/**
 * Bouton « Connecter FORGEIA CODE » : le jeton (10 min) est créé au moment du clic, pas à l'affichage
 * de la page — l'apprenant a souvent installé VS Code entre les deux.
 */
export async function GET(request: Request) {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) return NextResponse.redirect(new URL("/connexion", request.url));

  const access = getCourseAccess(enrollment);
  if (access.blocked || access.maxModuleSort < 0) {
    return NextResponse.redirect(new URL("/espace/assistant-ia", request.url));
  }
  return NextResponse.redirect(forgeiaCodeConnectUrl(createIaLinkToken(enrollment.id)));
}
