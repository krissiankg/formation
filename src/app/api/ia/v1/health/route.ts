import { CORS_HEADERS, FALLBACK_MODEL, PRIMARY_MODEL } from "@/lib/ia/gateway";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      status: process.env.NVIDIA_API_KEY?.trim() ? "healthy" : "not_configured",
      provider: "nvidia-nim",
      primary_model: PRIMARY_MODEL,
      fallback_model: FALLBACK_MODEL,
      version: "3.0.0",
    },
    { headers: CORS_HEADERS },
  );
}
