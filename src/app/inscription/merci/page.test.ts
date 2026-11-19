import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({ session: vi.fn(), groupUrl: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));
vi.mock("@/lib/auth/session", () => ({ getSessionEnrollment: mocks.session }));
vi.mock("@/lib/settings/whatsapp-group", () => ({ getWhatsAppGroupUrl: mocks.groupUrl }));
vi.mock("@/components/SiteHeader", () => ({ SiteHeader: () => null }));
vi.mock("@/components/SiteFooter", () => ({ SiteFooter: () => null }));
import InscriptionMerciPage from "./page";

const GROUP = "https://chat.whatsapp.com/AbCdEf123";

const student = (registration: "paid" | "pending") => ({
  id: "enr-1",
  fullName: "Awa Kossou",
  email: "awa@example.com",
  whatsapp: "01 66 36 87 05",
  schedule: "saturday",
  payments: [{ kind: "registration", amount: 2500, status: registration }],
});

const render = async () => renderToStaticMarkup(await InscriptionMerciPage());

beforeEach(() => {
  vi.resetAllMocks();
  mocks.groupUrl.mockResolvedValue(GROUP);
});

describe("page Merci après l'inscription", () => {
  it("without a session, sends back to the sign-up form", async () => {
    mocks.session.mockResolvedValue(null);
    await expect(render()).rejects.toThrow("REDIRECT /inscription");
  });

  it("a validated student goes to the student space", async () => {
    mocks.session.mockResolvedValue(student("paid"));
    await expect(render()).rejects.toThrow("REDIRECT /espace");
  });

  it("a new sign-up sees the button to join the WhatsApp group", async () => {
    mocks.session.mockResolvedValue(student("pending"));
    const html = await render();
    expect(html).toContain("Merci Awa");
    expect(html).toContain(`href="${GROUP}"`);
    expect(html).toContain("Rejoindre le groupe WhatsApp");
    expect(html).not.toContain("/espace");
  });

  it("without a saved group link, the button opens the trainer's WhatsApp", async () => {
    mocks.session.mockResolvedValue(student("pending"));
    mocks.groupUrl.mockResolvedValue(null);
    const html = await render();
    expect(html).toContain("Écrire au formateur sur WhatsApp");
    expect(html).toContain("https://wa.me/2290166368705");
    expect(html).not.toContain("chat.whatsapp.com");
  });
});
