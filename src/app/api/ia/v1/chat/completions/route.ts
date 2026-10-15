import { authorizeIaRequest, CORS_HEADERS, forwardChatCompletion, iaError } from "@/lib/ia/gateway";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  if (!(await authorizeIaRequest(request))) {
    return iaError(
      401,
      "Clé d'accès Forge IA invalide ou manquante. Copie ta clé personnelle depuis Ressources & IA dans ton espace apprenant.",
      "authentication_error",
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return iaError(400, "Corps JSON invalide", "invalid_request_error");
  }
  return forwardChatCompletion(payload);
}
