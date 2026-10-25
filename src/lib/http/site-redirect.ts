import { alternateSiteHostname, legacySiteHostnames, siteOrigin } from "@/lib/config/site";

/** Conserve les anciens liens de paiement et callbacks API pendant la migration. */
export function getSiteRedirect(request: Request, redirectLegacyDomains = false): URL | null {
  const url = new URL(request.url);
  if (!["GET", "HEAD"].includes(request.method) || url.pathname.startsWith("/api/")) {
    return null;
  }

  const host = (
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    url.host
  ).split(":")[0].toLowerCase();
  const legacyHost = (legacySiteHostnames as readonly string[]).includes(host);
  if (host !== alternateSiteHostname && !(redirectLegacyDomains && legacyHost)) {
    return null;
  }

  const destination = new URL(siteOrigin);
  destination.pathname = url.pathname;
  destination.search = url.search;
  return destination;
}
