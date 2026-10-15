import { CORS_HEADERS, PUBLIC_MODELS } from "@/lib/ia/gateway";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function GET() {
  return Response.json(
    { object: "list", data: PUBLIC_MODELS.map((m) => ({ ...m, object: "model" })) },
    { headers: CORS_HEADERS },
  );
}
