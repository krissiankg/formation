import { getCourseAccess } from "@/lib/access/course-access";
import { authenticateIaRequest } from "@/lib/ia/gateway";
import { CORS_HEADERS, iaError } from "@/lib/ia/http";
import { getIaBalance } from "@/lib/ia/usage-store";
import { getStudentProgress } from "@/lib/store/progress";

export const dynamic = "force-dynamic";

const SITE = "https://forgeia.guelichweb.store";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** Infos de l'apprenant pour les outils IA : prénom, crédit IA et exercice en cours. */
export async function GET(request: Request) {
  const caller = await authenticateIaRequest(request);
  if (!caller || caller.kind !== "student") {
    return iaError(401, "Clé refusée par FORGE IA", "authentication_error");
  }
  const { enrollment } = caller;

  const [balance, progress] = await Promise.all([
    getIaBalance(enrollment),
    getStudentProgress(enrollment.id, getCourseAccess(enrollment)),
  ]);
  const lesson = progress.modules.flatMap((m) => m.lessons).find((l) => l.status === "current");

  return Response.json(
    {
      firstName: enrollment.fullName.trim().split(/\s+/)[0],
      ...balance,
      currentLesson: lesson ? { title: lesson.title, url: `${SITE}/espace/programme/${lesson.id}` } : null,
    },
    { headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } },
  );
}
