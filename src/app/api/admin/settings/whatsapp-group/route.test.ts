import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), get: vi.fn(), set: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "test-session" }) }) }));
vi.mock("@/lib/auth/admin-session", () => ({
  ADMIN_SESSION_COOKIE: "forge_admin_session", verifyAdminSessionToken: mocks.verify,
}));
vi.mock("@/lib/settings/whatsapp-group", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/settings/whatsapp-group")>()),
  getWhatsAppGroupUrl: mocks.get,
  setWhatsAppGroupUrl: mocks.set,
}));
import { GET, PUT } from "./route";

const put = (body: unknown) =>
  PUT(new Request("https://www.forgeia.site/api/admin/settings/whatsapp-group", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.verify.mockResolvedValue(true);
  mocks.get.mockResolvedValue(null);
  mocks.set.mockResolvedValue(undefined);
});

describe("lien du groupe WhatsApp dans l'admin", () => {
  it("refuse un visiteur non authentifié", async () => {
    mocks.verify.mockResolvedValue(false);
    expect((await GET()).status).toBe(401);
    expect((await put({ url: "https://chat.whatsapp.com/AbCdEf123456" })).status).toBe(401);
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("refuse un lien qui n'est pas une invitation WhatsApp", async () => {
    const response = await put({ url: "https://evil.example/x" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Lien de groupe WhatsApp invalide." });
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("enregistre un lien valide", async () => {
    const response = await put({ url: " https://chat.whatsapp.com/AbCdEf123456 " });
    expect(mocks.set).toHaveBeenCalledWith("https://chat.whatsapp.com/AbCdEf123456");
    expect(await response.json()).toEqual({ url: "https://chat.whatsapp.com/AbCdEf123456" });
  });

  it("efface le lien avec une valeur vide", async () => {
    await put({ url: "" });
    expect(mocks.set).toHaveBeenCalledWith(null);
  });
});
