import { NextResponse } from "next/server";
import { getCourseAccess } from "@/lib/access/course-access";
import { getSessionEnrollment } from "@/lib/auth/session";
import { forgeiaCodeConnectUrl } from "@/lib/ia/extension-info";
import { createIaLinkToken } from "@/lib/ia/link-token";
import { getPublicOrigin } from "@/lib/http/public-origin";

export const dynamic = "force-dynamic";

/**
 * Bouton « Connecter FORGEIA CODE » : le jeton (10 min) est créé au moment du clic, pas à l'affichage
 * de la page — l'apprenant a souvent installé VS Code entre les deux.
 */
export async function GET(request: Request) {
  // Derrière CloudFront, request.url porte l'hôte interne : on redirige vers l'adresse publique.
  const origin = getPublicOrigin(request);
  const enrollment = await getSessionEnrollment();
  if (!enrollment) return NextResponse.redirect(`${origin}/connexion`);

  const access = getCourseAccess(enrollment);
  if (access.blocked || access.maxModuleSort < 0) {
    return NextResponse.redirect(`${origin}/espace/assistant-ia`);
  }
  return NextResponse.redirect(forgeiaCodeConnectUrl(createIaLinkToken(enrollment.id)));
}
