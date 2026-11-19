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
  it("the sign-up email and its reminder lead to the WhatsApp group", () => {
    const created = accountCreatedEmail({ firstname: "Awa", scheduleLabel: "Samedi matin", groupUrl });
    const reminder = registrationReminderEmail({ firstname: "Awa", scheduleLabel: "Samedi matin", groupUrl });
    for (const email of [created, reminder]) {
      expect(email.html).toContain(groupUrl);
      expect(email.text).toContain(`Rejoindre le groupe WhatsApp : ${groupUrl}`);
      expect(email.text).not.toContain("/inscription/paiement");
    }
  });

  it("without a group link, the sign-up email points to the trainer on WhatsApp", () => {
    const created = accountCreatedEmail({ firstname: "Awa", scheduleLabel: "Samedi matin", groupUrl: null });
    expect(created.text).toContain("https://wa.me/2290166368705");
    expect(created.text).not.toContain("chat.whatsapp.com");
  });

  it("a validated pre-registration without password invites the student to create one", () => {
    const passwordUrl = "https://www.forgeia.site/mot-de-passe/nouveau?token=abc";
    const confirmed = registrationConfirmedEmail({ firstname: "Awa", scheduleLabel: "Samedi matin", groupUrl, passwordUrl });
    expect(confirmed.text).toContain(`Créer mon mot de passe : ${passwordUrl}`);
    expect(confirmed.text).toContain("valable 7 jours");
  });

  it("a validated pre-registration with a password leads to the student space", () => {
    const confirmed = registrationConfirmedEmail({ firstname: "Awa", scheduleLabel: "Samedi matin", groupUrl: null });
    expect(confirmed.text).toContain("Accéder à mon espace : https://www.forgeia.site/espace");
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
