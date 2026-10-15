export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** Erreur au format OpenAI, lisible par les extensions (Kilo Code, Cline…). */
export function iaError(status: number, message: string, type = "gateway_error") {
  return Response.json({ error: { message, type, code: status } }, { status, headers: CORS_HEADERS });
}
