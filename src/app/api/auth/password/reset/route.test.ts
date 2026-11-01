import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getEnrollment: vi.fn(), update: vi.fn(), createSession: vi.fn() }));
vi.mock("@/lib/store/enrollments", () => ({ getEnrollment: mocks.getEnrollment, updateEnrollmentProfile: mocks.update }));
vi.mock("@/lib/auth/session", () => ({ createSession: mocks.createSession }));
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { POST } from "./route";

const reset = (body: unknown) =>
  POST(new Request("https://www.forgeia.site/api/auth/password/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ADMIN_SESSION_SECRET", "reset-route-secret");
});
afterEach(() => vi.unstubAllEnvs());

describe("nouveau mot de passe", () => {
  it("sets the new password and signs the student in", async () => {
    mocks.getEnrollment.mockResolvedValue({ id: "enr-1", passwordHash: undefined });
    const token = createPasswordResetToken({ id: "enr-1" });
    const response = await reset({ token, password: "nouveau123", passwordConfirm: "nouveau123" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ redirectTo: "/espace" });
    expect(mocks.update).toHaveBeenCalledWith("enr-1", { password: "nouveau123" });
    expect(mocks.createSession).toHaveBeenCalledWith("enr-1");
  });

  it("refuses a link minted before the password changed", async () => {
    const token = createPasswordResetToken({ id: "enr-1", passwordHash: "ancien:hash" });
    mocks.getEnrollment.mockResolvedValue({ id: "enr-1", passwordHash: "nouveau:hash" });
    const response = await reset({ token, password: "nouveau123", passwordConfirm: "nouveau123" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Ce lien n'est plus valable. Demande un nouveau lien." });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("refuses a short password", async () => {
    mocks.getEnrollment.mockResolvedValue({ id: "enr-1", passwordHash: undefined });
    const token = createPasswordResetToken({ id: "enr-1" });
    const response = await reset({ token, password: "court", passwordConfirm: "court" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Le mot de passe doit contenir au moins 8 caractères." });
  });
});
