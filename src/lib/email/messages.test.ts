import { describe, expect, it } from "vitest";
import {
  accountCreatedEmail,
  adminAlertEmail,
  paymentReceivedEmail,
  projectReviewedEmail,
  registrationConfirmedEmail,
  registrationReminderEmail,
} from "@/lib/email/messages";

const groupUrl = "https://chat.whatsapp.com/AbCdEf123456";

describe("email messages", () => {
  it("the WhatsApp group link is only in the confirmed registration email", () => {
    const confirmed = registrationConfirmedEmail({ firstname: "Awa", scheduleLabel: "Samedi matin", groupUrl });
    expect(confirmed.html).toContain(groupUrl);
    expect(confirmed.text).toContain(groupUrl);

    const created = accountCreatedEmail({ firstname: "Awa", scheduleLabel: "Samedi matin", amount: 2500 });
    const reminder = registrationReminderEmail({ firstname: "Awa", scheduleLabel: "Samedi matin" });
    for (const email of [created, reminder]) {
      expect(email.html).not.toContain("chat.whatsapp.com");
      expect(email.text).not.toContain("chat.whatsapp.com");
    }
  });

  it("no group block when the link is not set", () => {
    const confirmed = registrationConfirmedEmail({ firstname: "Awa", scheduleLabel: "Samedi matin", groupUrl: null });
    expect(confirmed.text).not.toContain("groupe WhatsApp");
  });

  it("project review without score or comment", () => {
    const { text } = projectReviewedEmail({ firstname: "Awa", title: "Landing", approved: false, score: null, feedback: "" });
    expect(text).toContain("modifications demandées");
    expect(text).not.toContain("null");
    expect(text).not.toContain("Commentaire");
  });

  it("admin alert subject", () => {
    const alert = adminAlertEmail("Nouvelle inscription", [["Nom", "Awa K"]]);
    expect(alert.subject).toBe("[FORGE IA] Nouvelle inscription");
    expect(alert.text).toContain("Nom : Awa K");
  });

  it("payment receipt link", () => {
    const { text } = paymentReceivedEmail({ firstname: "Awa", label: "Tranche 1 (Démarrage)", amount: 30000, kind: "start" });
    expect(text).toContain("https://www.forgeia.site/espace/paiements/recu/start");
    expect(text).toMatch(/30\s000/);
  });
});
