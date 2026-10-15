import { CORS_HEADERS, handleChatCompletion } from "@/lib/ia/gateway";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function POST(request: Request) {
  return handleChatCompletion(request);
}
