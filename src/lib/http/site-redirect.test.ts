import { describe, expect, it } from "vitest";
import { getSiteRedirect } from "./site-redirect";

describe("redirections de domaine", () => {
  it("redirige le domaine nu en HTTPS vers www en conservant chemin et paramètres encodés", () => {
    const request = new Request("https://forgeia.site/inscription/confirmation?id=a%2Fb&next=%2Fespace");
    expect(getSiteRedirect(request)?.href).toBe(
      "https://www.forgeia.site/inscription/confirmation?id=a%2Fb&next=%2Fespace",
    );
  });

  it("reconnaît l'hôte du visiteur derrière CloudFront et l'ALB", () => {
    const request = new Request("http://localhost:3000/espace?tab=programme", {
      headers: { "x-forwarded-host": "FORGEIA.SITE:443" },
    });
    expect(getSiteRedirect(request)?.href).toBe("https://www.forgeia.site/espace?tab=programme");
  });

  it.each(["forgeia.guelichweb.store", "forgia.guelichweb.store"])(
    "garde %s disponible avant la bascule DNS, puis le redirige après activation",
    (host) => {
      const request = new Request(`https://${host}/espace/programme?week=1`);
      expect(getSiteRedirect(request)).toBeNull();
      expect(getSiteRedirect(request, true)?.href).toBe("https://www.forgeia.site/espace/programme?week=1");
    },
  );

  it.each(["www.forgeia.site", "aws-test.guelichweb.store", "ia.guelichweb.store", "localhost:3000"])(
    "ne redirige pas %s et évite les boucles et les changements des domaines techniques",
    (host) => {
      expect(getSiteRedirect(new Request(`https://${host}/`), true)).toBeNull();
    },
  );

  it.each([
    ["POST", "/api/webhooks/fedapay"],
    ["GET", "/api/admin/drive/callback?code=exemple&state=exemple"],
    ["POST", "/api/admin/auth/login"],
    ["POST", "/inscription"],
  ])("préserve %s %s sur l'ancien domaine pour les callbacks et formulaires en cours", (method, path) => {
    const request = new Request(`https://forgeia.guelichweb.store${path}`, { method });
    expect(getSiteRedirect(request, true)).toBeNull();
  });

  it("redirige aussi les requêtes HEAD", () => {
    const request = new Request("https://forgeia.site/connexion", { method: "HEAD" });
    expect(getSiteRedirect(request)?.href).toBe("https://www.forgeia.site/connexion");
  });
});
