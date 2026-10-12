import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  // API interne (Kong local) — évite la page de login nginx sur le domaine public.
  const url =
    process.env.SUPABASE_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase non configuré : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.",
    );
  }

  if (!adminClient) {
    // Hors VPS (AWS), le domaine public Supabase est derrière une page de login nginx :
    // l'en-tête X-Forgeia-Gate ouvre l'accès à /rest/v1/ (voir deploy/supabase-login/forgeia-api.sh).
    const gateToken = process.env.SUPABASE_GATE_TOKEN;
    adminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: gateToken ? { headers: { "X-Forgeia-Gate": gateToken } } : undefined,
    });
  }

  return adminClient;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
