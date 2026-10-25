import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

afterEach(() => vi.unstubAllEnvs());

describe("proxy pendant la migration de domaine", () => {
  it("redirige le domaine nu vers www avant le rendu d'une page", async () => {
    const response = await proxy(new NextRequest("https://forgeia.site/connexion?next=%2Fespace"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://www.forgeia.site/connexion?next=%2Fespace");
  });

  it("maintient l'authentification des API admin sur les nouveaux domaines", async () => {
    const response = await proxy(new NextRequest("https://www.forgeia.site/api/admin/content"));
    expect(response.status).toBe(401);
  });

  it("laisse l'ancien domaine accessible tant que la bascule est désactivée", async () => {
    vi.stubEnv("LEGACY_DOMAIN_REDIRECTS", "false");
    const response = await proxy(new NextRequest("https://forgeia.guelichweb.store/inscription"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("active la redirection de l'ancien domaine après la bascule", async () => {
    vi.stubEnv("LEGACY_DOMAIN_REDIRECTS", "true");
    const response = await proxy(new NextRequest("https://forgeia.guelichweb.store/espace"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://www.forgeia.site/espace");
  });

});
