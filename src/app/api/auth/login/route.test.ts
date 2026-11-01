import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findByEmail: vi.fn(), createSession: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/store/progress", () => ({ initStudentProgress: vi.fn() }));
vi.mock("@/lib/store/enrollments", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/store/enrollments")>()),
  findEnrollmentByEmail: mocks.findByEmail,
}));
vi.mock("@/lib/auth/session", () => ({ createSession: mocks.createSession }));
import { hashPassword } from "@/lib/store/enrollments";
import { POST } from "./route";

const login = (body: unknown) =>
  POST(new Request("https://www.forgeia.site/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));

const account = (passwordHash?: string) => ({ id: "enr-1", email: "awa@example.com", fullName: "Awa", passwordHash });

beforeEach(() => vi.resetAllMocks());

describe("connexion par mot de passe", () => {
  it("signs in with the right password", async () => {
    mocks.findByEmail.mockResolvedValue(account(hashPassword("motdepasse1")));
    const response = await login({ email: "awa@example.com", password: "motdepasse1" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, redirectTo: "/espace" });
    expect(mocks.createSession).toHaveBeenCalledWith("enr-1");
  });

  it("refuses a wrong password", async () => {
    mocks.findByEmail.mockResolvedValue(account(hashPassword("motdepasse1")));
    const response = await login({ email: "awa@example.com", password: "mauvais123" });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Email ou mot de passe incorrect." });
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("tells an existing student without a password how to create one", async () => {
    mocks.findByEmail.mockResolvedValue(account(undefined));
    const response = await login({ email: "awa@example.com", password: "nimporte" });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Ton compte n'a pas encore de mot de passe. Clique sur « Mot de passe oublié » pour le créer.",
      needsPassword: true,
    });
  });

  it("no longer signs in with email and WhatsApp number", async () => {
    mocks.findByEmail.mockResolvedValue(account(undefined));
    const response = await login({ email: "awa@example.com", whatsapp: "0166368705" });
    expect(response.status).toBe(401);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
});
