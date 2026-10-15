import { CORS_HEADERS } from "@/lib/ia/gateway";
import { getIaProvider } from "@/lib/ia/providers";

export const dynamic = "force-dynamic";

export function GET() {
  const provider = getIaProvider();
  return Response.json(
    {
      status: provider.apiKey ? "healthy" : "not_configured",
      provider: provider.id,
      primary_model: provider.resolveModel("forgeia-coder"),
      fallback_model: provider.resolveModel(provider.fallbackAlias),
      version: "3.1.0",
    },
    { headers: CORS_HEADERS },
  );
}
