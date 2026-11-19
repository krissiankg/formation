import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEnrollment: vi.fn(),
  markPaid: vi.fn(),
  revert: vi.fn(),
  notifyStudent: vi.fn(),
  groupUrl: vi.fn(),
}));
vi.mock("@/lib/store/enrollments", () => ({
  getEnrollment: mocks.getEnrollment,
  markPaymentPaid: mocks.markPaid,
  revertManualPayment: mocks.revert,
}));
vi.mock("@/lib/email/notify", () => ({ notifyStudent: mocks.notifyStudent }));
vi.mock("@/lib/settings/whatsapp-group", () => ({ getWhatsAppGroupUrl: mocks.groupUrl }));
import { POST } from "./route";

const validate = (kind = "registration") =>
  POST(new Request("https://www.forgeia.site/api/admin/enrollments/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "enr-1", kind, paid: true }),
  }));

const student = (passwordHash?: string) => ({
  id: "enr-1",
  fullName: "Awa Kossou",
  email: "awa@example.com",
  schedule: "saturday",
  passwordHash,
  payments: [
    { kind: "registration", amount: 2500, status: "pending" },
    { kind: "start", amount: 30000, status: "pending" },
  ],
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ADMIN_SESSION_SECRET", "payment-test-secret");
  mocks.notifyStudent.mockResolvedValue({ ok: true, stub: false });
  mocks.groupUrl.mockResolvedValue(null);
});
afterEach(() => vi.unstubAllEnvs());

describe("validation manuelle d'un paiement par le formateur", () => {
  it("a validated pre-registration without password sends the link to create one", async () => {
    mocks.getEnrollment.mockResolvedValue(student());
    const response = await validate();
    expect(response.status).toBe(200);
    expect(mocks.markPaid).toHaveBeenCalledWith("enr-1", "registration", expect.any(String));
    const [, message] = mocks.notifyStudent.mock.calls[0] as [unknown, { subject: string; text: string }];
    expect(message.subject).toBe("Bienvenue dans FORGE IA : ta place est réservée");
    expect(message.text).toContain("Créer mon mot de passe : https://www.forgeia.site/mot-de-passe/nouveau?token=");
  });

  it("a student who already has a password is sent to the student space", async () => {
    mocks.getEnrollment.mockResolvedValue(student("salt:hash"));
    await validate();
    const [, message] = mocks.notifyStudent.mock.calls[0] as [unknown, { text: string }];
    expect(message.text).toContain("Accéder à mon espace : https://www.forgeia.site/espace");
    expect(message.text).not.toContain("mot-de-passe/nouveau");
  });
});
