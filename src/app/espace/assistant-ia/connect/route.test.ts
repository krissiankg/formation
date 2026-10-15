import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({ getSessionEnrollment: async () => null }));

describe("GET /espace/assistant-ia/connect", () => {
  it("sends a visitor without session to the public login page, not the internal host", async () => {
    const { GET } = await import("./route");
    const request = new Request("http://ip-10-0-1-100.eu-west-3.compute.internal:3000/espace/assistant-ia/connect", {
      headers: { host: "forgeia.guelichweb.store", "cloudfront-forwarded-proto": "https" },
    });
    const response = await GET(request);
    expect(response.headers.get("location")).toBe("https://forgeia.guelichweb.store/connexion");
  }, 60_000);
});
