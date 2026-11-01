import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findByEmail: vi.fn(), notifyStudent: vi.fn() }));
vi.mock("@/lib/store/enrollments", () => ({ findEnrollmentByEmail: mocks.findByEmail }));
vi.mock("@/lib/email/notify", () => ({ notifyStudent: mocks.notifyStudent }));
import { POST } from "./route";

const forgot = (email: string) =>
  POST(new Request("https://www.forgeia.site/api/auth/password/forgot", {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "www.forgeia.site" },
    body: JSON.stringify({ email }),
  }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ADMIN_SESSION_SECRET", "forgot-test-secret");
  mocks.notifyStudent.mockResolvedValue({ ok: true, stub: false });
});
afterEach(() => vi.unstubAllEnvs());

describe("mot de passe oublié", () => {
  it("answers the same way for an unknown email and sends nothing", async () => {
    mocks.findByEmail.mockResolvedValue(null);
    const response = await forgot("inconnu@example.com");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mocks.notifyStudent).not.toHaveBeenCalled();
  });

  it("emails a link to set a new password", async () => {
    mocks.findByEmail.mockResolvedValue({ id: "enr-1", email: "awa@example.com", fullName: "Awa K" });
    await forgot("awa@example.com");
    expect(mocks.notifyStudent).toHaveBeenCalledTimes(1);
    const [, message] = mocks.notifyStudent.mock.calls[0] as [unknown, { text: string; subject: string }];
    expect(message.text).toContain("https://www.forgeia.site/mot-de-passe/nouveau?token=");
    expect(message.subject).toBe("Crée ton mot de passe FORGE IA");
  });

  it("sends at most one email per address per minute", async () => {
    mocks.findByEmail.mockResolvedValue({ id: "enr-2", email: "kofi@example.com", fullName: "Kofi", passwordHash: "s:h" });
    expect((await forgot("kofi@example.com")).status).toBe(200);
    expect((await forgot("Kofi@Example.com")).status).toBe(200);
    expect(mocks.notifyStudent).toHaveBeenCalledTimes(1);
  });
});
