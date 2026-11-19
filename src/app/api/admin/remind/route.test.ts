import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), getEnrollment: vi.fn(), notifyStudent: vi.fn(), groupUrl: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "test-session" }) }) }));
vi.mock("@/lib/auth/admin-session", () => ({
  ADMIN_SESSION_COOKIE: "forge_admin_session", verifyAdminSessionToken: mocks.verify,
}));
vi.mock("@/lib/store/enrollments", () => ({ getEnrollment: mocks.getEnrollment }));
vi.mock("@/lib/email/notify", () => ({ notifyStudent: mocks.notifyStudent }));
vi.mock("@/lib/settings/whatsapp-group", () => ({ getWhatsAppGroupUrl: mocks.groupUrl }));
import { POST } from "./route";

const remind = (body: unknown) =>
  POST(new Request("https://www.forgeia.site/api/admin/remind", {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "www.forgeia.site" },
    body: JSON.stringify(body),
  }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ADMIN_SESSION_SECRET", "remind-test-secret");
  mocks.verify.mockResolvedValue(true);
  mocks.notifyStudent.mockResolvedValue({ ok: true, stub: false });
  mocks.groupUrl.mockResolvedValue("https://chat.whatsapp.com/AbCdEf123");
  mocks.getEnrollment.mockResolvedValue({
    id: "enr-1",
    fullName: "Awa Kossou",
    email: "awa@example.com",
    schedule: "saturday",
    passwordHash: undefined,
  });
});
afterEach(() => vi.unstubAllEnvs());

describe("relance par email depuis l'admin", () => {
  it("sends a password creation link to a student without a password", async () => {
    const response = await remind({ enrollmentId: "enr-1", type: "password" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, sentTo: "awa@example.com" });
    const [, message] = mocks.notifyStudent.mock.calls[0] as [unknown, { subject: string; text: string }];
    expect(message.subject).toBe("Crée ton mot de passe FORGE IA");
    expect(message.text).toContain("/mot-de-passe/nouveau?token=");
  });

  it("builds the password link on the real site even behind a forged host header", async () => {
    await POST(new Request("https://www.forgeia.site/api/admin/remind", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-host": "evil.tld" },
      body: JSON.stringify({ enrollmentId: "enr-1", type: "password" }),
    }));
    const [, message] = mocks.notifyStudent.mock.calls[0] as [unknown, { text: string; html: string }];
    expect(message.text).toContain("https://www.forgeia.site/mot-de-passe/nouveau?token=");
    expect(message.html).not.toContain("evil.tld");
  });

  it("a first-password link lasts 7 days", async () => {
    await remind({ enrollmentId: "enr-1", type: "password" });
    const [, message] = mocks.notifyStudent.mock.calls[0] as [unknown, { text: string }];
    expect(message.text).toContain("valable 7 jours");
  });

  it("the sign-up reminder leads to the WhatsApp group, not to an online payment", async () => {
    const response = await remind({ enrollmentId: "enr-1", type: "registration" });
    expect(response.status).toBe(200);
    const [, message] = mocks.notifyStudent.mock.calls[0] as [unknown, { text: string }];
    expect(message.text).toContain("Rejoindre le groupe WhatsApp : https://chat.whatsapp.com/AbCdEf123");
    expect(message.text).not.toContain("/inscription/paiement");
  });

  it("refuses an unknown reminder type", async () => {
    const response = await remind({ enrollmentId: "enr-1", type: "bogus" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Type de message invalide" });
    expect(mocks.notifyStudent).not.toHaveBeenCalled();
  });

  it("reports a failed email", async () => {
    mocks.notifyStudent.mockResolvedValue({ ok: false, stub: false });
    const response = await remind({ enrollmentId: "enr-1", type: "payment" });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Échec de l'envoi de l'email" });
  });
});
