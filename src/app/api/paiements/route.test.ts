import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ session: vi.fn(), getEnrollment: vi.fn(), createTx: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getSessionEnrollment: mocks.session }));
vi.mock("@/lib/store/enrollments", () => ({ getEnrollment: mocks.getEnrollment }));
vi.mock("@/lib/integrations", () => ({ createFedapayTransaction: mocks.createTx }));
import { POST } from "./route";

const enrollment = (registration: "paid" | "pending") => ({
  id: "enr-1",
  fullName: "Awa Kossou",
  email: "awa@example.com",
  whatsapp: "0166368705",
  schedule: "saturday",
  payments: [
    { kind: "registration", amount: 2500, status: registration },
    { kind: "start", amount: 30000, status: "pending" },
  ],
});

const pay = (kind: string) =>
  POST(new Request("https://www.forgeia.site/api/paiements", {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "www.forgeia.site" },
    body: JSON.stringify({ kind }),
  }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.session.mockResolvedValue({ id: "enr-1" });
  mocks.createTx.mockResolvedValue({ id: "tx-1", paymentUrl: "https://process.fedapay.com/tx-1", stub: false });
});

describe("paiement depuis le compte", () => {
  it("a student can pay the pre-registration and returns to the payment page", async () => {
    mocks.getEnrollment.mockResolvedValue(enrollment("pending"));
    const response = await pay("registration");
    expect(response.status).toBe(200);
    expect(mocks.createTx).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 2500, callbackUrl: "https://www.forgeia.site/inscription/paiement?retour=1" }),
    );
    expect(await response.json()).toEqual({ paymentUrl: "https://process.fedapay.com/tx-1", stub: false });
  });

  it("an installment keeps its return page", async () => {
    mocks.getEnrollment.mockResolvedValue(enrollment("paid"));
    await pay("start");
    const { callbackUrl } = mocks.createTx.mock.calls[0][0] as { callbackUrl: string };
    expect(callbackUrl.startsWith("https://www.forgeia.site/espace/paiements")).toBe(true);
  });

  it("an already paid pre-registration is refused", async () => {
    mocks.getEnrollment.mockResolvedValue(enrollment("paid"));
    const response = await pay("registration");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Cette tranche a déjà été réglée." });
    expect(mocks.createTx).not.toHaveBeenCalled();
  });
});
