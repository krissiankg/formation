import { getCourseAccess } from "@/lib/access/course-access";
import { CORS_HEADERS, IA_BASE_URL, iaError } from "@/lib/ia/http";
import { readIaLinkToken } from "@/lib/ia/link-token";
import { createStudentIaKey } from "@/lib/ia/student-key";
import { getEnrollment } from "@/lib/store/enrollments";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** Échange le jeton du lien « Connecter FORGEIA CODE » contre la clé personnelle de l'apprenant. */
export async function POST(request: Request) {
  let token: unknown;
  try {
    ({ token } = (await request.json()) as { token?: unknown });
  } catch {
    return iaError(400, "Corps JSON invalide", "invalid_request_error");
  }
  if (typeof token !== "string" || !token) return iaError(400, "Jeton manquant", "invalid_request_error");

  const enrollmentId = readIaLinkToken(token);
  if (!enrollmentId) {
    return iaError(401, "Lien expiré ou invalide. Reclique sur « Connecter FORGEIA CODE » dans ton espace.", "authentication_error");
  }

  const enrollment = await getEnrollment(enrollmentId);
  const access = enrollment ? getCourseAccess(enrollment) : null;
  if (!enrollment || !access || access.blocked || access.maxModuleSort < 0) {
    return iaError(403, "Ton accès à l'assistant IA n'est pas actif. Contacte le formateur.", "permission_error");
  }

  return Response.json(
    {
      apiKey: createStudentIaKey(enrollment.id),
      baseUrl: IA_BASE_URL,
      firstName: enrollment.fullName.trim().split(/\s+/)[0],
    },
    { headers: CORS_HEADERS },
  );
}
