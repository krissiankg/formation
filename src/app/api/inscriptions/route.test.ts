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
  password: "motdepasse1",
  passwordConfirm: "motdepasse1",
};

const register = () =>
  POST(new Request("https://www.forgeia.site/api/inscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "www.forgeia.site" },
    body: JSON.stringify(body),
  }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.findByEmail.mockResolvedValue(null);
  mocks.create.mockImplementation(async (input: { fullName: string; email: string }) => ({
    id: "enr-1",
    ...input,
    schedule: "saturday",
    payments: [],
  }));
  mocks.createTx.mockResolvedValue({ id: "tx-1", paymentUrl: "https://process.fedapay.com/tx-1", stub: false });
  mocks.notifyStudent.mockResolvedValue({ ok: true, stub: false });
  mocks.notifyAdmin.mockResolvedValue({ ok: true, stub: false });
  mocks.telegram.mockResolvedValue({ ok: true, stub: true });
});

describe("inscription avec mot de passe", () => {
  it("an existing email is sent to the login page", async () => {
    mocks.findByEmail.mockResolvedValue({ id: "old" });
    const response = await register();
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "Un compte existe déjà avec cet email. Connecte-toi pour continuer.",
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("creates the account, signs the student in and starts the payment", async () => {
    const response = await register();

    const input = mocks.create.mock.calls[0][0] as { passwordHash: string };
    expect(input.passwordHash).toBeTruthy();
    expect(input.passwordHash).not.toBe("motdepasse1");
    expect(mocks.createSession).toHaveBeenCalledWith("enr-1");
    expect(mocks.createTx).toHaveBeenCalledWith(
      expect.objectContaining({ callbackUrl: "https://www.forgeia.site/inscription/paiement?retour=1" }),
    );
    expect(mocks.notifyStudent).toHaveBeenCalledTimes(1);
    expect(mocks.notifyAdmin).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ enrollmentId: "enr-1", paymentUrl: "https://process.fedapay.com/tx-1" });
  });

  it("a retry by the same signed-in student goes to the payment page instead of « compte existe »", async () => {
    mocks.findByEmail.mockResolvedValue({ id: "enr-1", payments: [{ kind: "registration", amount: 2500, status: "pending" }] });
    mocks.session.mockResolvedValue({ id: "enr-1" });
    const response = await register();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ enrollmentId: "enr-1", paymentUrl: null, redirectTo: "/inscription/paiement" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("a failing Telegram alert does not break the sign-up", async () => {
    mocks.telegram.mockRejectedValue(new TypeError("fetch failed"));
    const response = await register();
    expect(response.status).toBe(200);
    expect((await response.json()).paymentUrl).toBe("https://process.fedapay.com/tx-1");
  });

  it("FedaPay down still lets the student retry from the payment page", async () => {
    mocks.createTx.mockRejectedValue(new Error("FedaPay error: 503"));
    const response = await register();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      enrollmentId: "enr-1",
      paymentUrl: null,
      redirectTo: "/inscription/paiement",
    });
    expect(mocks.createSession).toHaveBeenCalledWith("enr-1");
  });
});
