import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  create: vi.fn(),
  createSession: vi.fn(),
  createTx: vi.fn(),
  telegram: vi.fn(),
  notifyStudent: vi.fn(),
  notifyAdmin: vi.fn(),
  session: vi.fn(),
  groupUrl: vi.fn(),
}));
vi.mock("@/lib/store/enrollments", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/store/enrollments")>()),
  findEnrollmentByEmail: mocks.findByEmail,
  createEnrollment: mocks.create,
}));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ createSession: mocks.createSession, getSessionEnrollment: mocks.session }));
vi.mock("@/lib/integrations", () => ({ createFedapayTransaction: mocks.createTx, notifyTelegram: mocks.telegram }));
vi.mock("@/lib/email/notify", () => ({ notifyStudent: mocks.notifyStudent, notifyAdmin: mocks.notifyAdmin }));
vi.mock("@/lib/settings/whatsapp-group", () => ({ getWhatsAppGroupUrl: mocks.groupUrl }));
vi.mock("@/lib/enrollment/seats-server", () => ({
  getSeats: async () => ({
    saturday: { taken: 0, left: 20, full: false },
    saturday_pm: { taken: 0, left: 20, full: false },
    sunday: { taken: 0, left: 20, full: false },
  }),
}));
import { POST } from "./route";

const body = {
  fullName: "Awa Kossou",
  email: "awa@example.com",
  whatsapp: "01 66 36 87 05",
  schedule: "saturday",
  acceptTerms: true,
};

const register = (overrides: Record<string, unknown> = {}) =>
  POST(new Request("https://www.forgeia.site/api/inscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "www.forgeia.site" },
    body: JSON.stringify({ ...body, ...overrides }),
  }));

const GROUP = "https://chat.whatsapp.com/AbCdEf123";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.findByEmail.mockResolvedValue(null);
  mocks.create.mockImplementation(async (input: { fullName: string; email: string }) => ({
    id: "enr-1",
    ...input,
    schedule: "saturday",
    payments: [],
  }));
  mocks.notifyStudent.mockResolvedValue({ ok: true, stub: false });
  mocks.notifyAdmin.mockResolvedValue({ ok: true, stub: false });
  mocks.telegram.mockResolvedValue({ ok: true, stub: true });
  mocks.groupUrl.mockResolvedValue(GROUP);
});

describe("inscription sans paiement en ligne", () => {
  it("a class that is not open for sign-up is refused, even with free seats", async () => {
    const response = await register({ schedule: "sunday" });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "La classe « Dimanche matin » n'est pas ouverte pour cette cohorte.",
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("creates the account without password nor payment, then sends the student to the thank-you page", async () => {
    const response = await register();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ enrollmentId: "enr-1", redirectTo: "/inscription/merci" });
    const input = mocks.create.mock.calls[0][0] as { passwordHash?: string; payments: { kind: string; amount: number }[] };
    expect(input.passwordHash).toBeUndefined();
    // L'échéancier ne change pas : la préinscription se règle au formateur, qui la valide dans l'admin.
    expect(input.payments.map((p) => [p.kind, p.amount])).toEqual([
      ["registration", 2500],
      ["start", 30000],
      ["month1", 47500],
    ]);
    expect(mocks.createSession).toHaveBeenCalledWith("enr-1");
    expect(mocks.createTx).not.toHaveBeenCalled();
    expect(mocks.notifyAdmin).toHaveBeenCalledTimes(1);
  });

  it("a password sent by an old version of the form is not stored", async () => {
    await register({ password: "motdepasse1" });
    expect((mocks.create.mock.calls[0][0] as { passwordHash?: string }).passwordHash).toBeUndefined();
  });

  it("the confirmation email carries the WhatsApp group link", async () => {
    await register();
    expect(mocks.notifyStudent).toHaveBeenCalledTimes(1);
    const message = mocks.notifyStudent.mock.calls[0][1] as { subject: string; html: string; text: string };
    expect(message.text).toContain(GROUP);
    expect(message.html).toContain(GROUP);
  });

  it("without a saved group link, the email points to the trainer's WhatsApp", async () => {
    mocks.groupUrl.mockResolvedValue(null);
    await register();
    const message = mocks.notifyStudent.mock.calls[0][1] as { text: string };
    expect(message.text).toContain("https://wa.me/2290166368705");
  });

  it("an email already signed up but not validated gets a message, not a second account", async () => {
    mocks.findByEmail.mockResolvedValue({ id: "old", payments: [{ kind: "registration", status: "pending" }] });
    const response = await register();
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error:
        "Tu es déjà inscrit avec cet email. Le lien du groupe WhatsApp est dans ton email de confirmation ; sinon, écris au formateur sur WhatsApp.",
    });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it("an email of a validated student is sent to the login page", async () => {
    mocks.findByEmail.mockResolvedValue({ id: "old", payments: [{ kind: "registration", status: "paid" }] });
    const response = await register();
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "Un compte existe déjà avec cet email. Connecte-toi pour continuer.",
    });
  });

  it("a retry by the same signed-in student goes back to the thank-you page", async () => {
    mocks.findByEmail.mockResolvedValue({ id: "enr-1", payments: [{ kind: "registration", amount: 2500, status: "pending" }] });
    mocks.session.mockResolvedValue({ id: "enr-1" });
    const response = await register();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ enrollmentId: "enr-1", redirectTo: "/inscription/merci" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("a failing Telegram alert or email does not break the sign-up", async () => {
    mocks.telegram.mockRejectedValue(new TypeError("fetch failed"));
    mocks.notifyStudent.mockRejectedValue(new Error("Brevo 500"));
    const response = await register();
    expect(response.status).toBe(200);
    expect((await response.json()).redirectTo).toBe("/inscription/merci");
  });
});
