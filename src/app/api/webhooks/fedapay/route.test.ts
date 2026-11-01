import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  getEnrollment: vi.fn(),
  markRegistrationPaid: vi.fn(),
  markPaymentPaid: vi.fn(),
  telegram: vi.fn(),
  notifyStudent: vi.fn(),
  notifyAdmin: vi.fn(),
  groupUrl: vi.fn(),
}));
vi.mock("@/lib/fedapay/webhook", () => ({ verifyFedapayWebhook: mocks.verify }));
vi.mock("@/lib/store/enrollments", () => ({
  getEnrollment: mocks.getEnrollment,
  markRegistrationPaid: mocks.markRegistrationPaid,
  markPaymentPaid: mocks.markPaymentPaid,
}));
vi.mock("@/lib/integrations", () => ({ notifyTelegram: mocks.telegram }));
vi.mock("@/lib/email/notify", () => ({ notifyStudent: mocks.notifyStudent, notifyAdmin: mocks.notifyAdmin }));
vi.mock("@/lib/settings/whatsapp-group", () => ({ getWhatsAppGroupUrl: mocks.groupUrl }));
import { POST } from "./route";

const student = (registration: "paid" | "pending", start: "paid" | "pending" = "pending") => ({
  id: "enr-1",
  fullName: "Awa Kossou",
  email: "awa@example.com",
  whatsapp: "0166368705",
  schedule: "saturday",
  payments: [
    { kind: "registration", amount: 2500, status: registration },
    { kind: "start", amount: 30000, status: start },
  ],
});

const approved = (kind: string) => {
  mocks.verify.mockReturnValue({
    name: "transaction.approved",
    entity: { id: 4242, amount: kind === "registration" ? 2500 : 30000, status: "approved", custom_metadata: { enrollmentId: "enr-1", kind } },
  });
  return POST(new Request("https://www.forgeia.site/api/webhooks/fedapay", { method: "POST", body: "{}" }));
};

const studentEmail = () => (mocks.notifyStudent.mock.calls[0] as [unknown, { html: string; text: string }])[1];

beforeEach(() => {
  vi.resetAllMocks();
  mocks.groupUrl.mockResolvedValue("https://chat.whatsapp.com/AbCdEf123456");
  mocks.notifyStudent.mockResolvedValue({ ok: true, stub: false });
  mocks.notifyAdmin.mockResolvedValue({ ok: true, stub: false });
  mocks.telegram.mockResolvedValue({ ok: true, stub: true });
});

describe("webhook FedaPay", () => {
  it("a paid pre-registration sends the welcome email with the WhatsApp group link", async () => {
    mocks.getEnrollment.mockResolvedValue(student("pending"));
    mocks.markRegistrationPaid.mockResolvedValue(student("paid"));

    const response = await approved("registration");

    expect(response.status).toBe(200);
    expect(studentEmail().text).toContain("https://chat.whatsapp.com/AbCdEf123456");
    expect(mocks.notifyAdmin).toHaveBeenCalledTimes(1);
  });

  it("an installment payment email never contains the group link", async () => {
    mocks.getEnrollment.mockResolvedValue(student("paid"));
    mocks.markPaymentPaid.mockResolvedValue(student("paid", "paid"));

    await approved("start");

    expect(studentEmail().text).not.toContain("chat.whatsapp.com");
    expect(studentEmail().text).toContain("/espace/paiements/recu/start");
  });
});
