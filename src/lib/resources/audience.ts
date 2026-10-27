export type ResourceAudience = "student" | "admin";

export function resourceApiBase(audience: ResourceAudience) {
  return audience === "admin" ? "/api/admin/ressources" : "/api/ressources";
}

/** Le chemin choisit la session à vérifier, jamais le Referer ou un paramètre client. */
export function isAdminResourceRequest(request?: Request) {
  return Boolean(request && new URL(request.url).pathname.startsWith("/api/admin/ressources/"));
}
