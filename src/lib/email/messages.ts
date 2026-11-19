/**
 * Emails envoyés par FORGE IA. Un seul appel à l'action par email.
 */

import type { EmailMessage } from "@/lib/email/brevo";
import { renderEmail } from "@/lib/email/layout";
import { siteOrigin } from "@/lib/config/site";
import { contact, formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";

function message(subject: string, content: Parameters<typeof renderEmail>[0]): EmailMessage {
  return { subject, ...renderEmail(content) };
}

const hello = (firstname: string) => `Bonjour ${firstname.trim() || "à toi"},`;

/** Bouton qui mène au groupe WhatsApp de la formation, ou au formateur si le lien n'est pas enregistré. */
function groupButton(groupUrl: string | null) {
  return groupUrl
    ? { label: "Rejoindre le groupe WhatsApp", url: groupUrl }
    : { label: "Écrire au formateur sur WhatsApp", url: contact.whatsappUrl };
}

const groupFootnote = `Si le bouton ne s'ouvre pas, écris au formateur sur WhatsApp au ${contact.whatsappDisplay}.`;

export function accountCreatedEmail(input: { firstname: string; scheduleLabel: string; groupUrl: string | null }) {
  return message("Ton inscription FORGE IA est enregistrée : rejoins le groupe WhatsApp", {
    title: "Dernière étape : rejoins le groupe WhatsApp",
    paragraphs: [
      hello(input.firstname),
      `Merci pour ton inscription à la formation FORGE IA (${input.scheduleLabel}), qui commence le ${formation.startLabel}.`,
      input.groupUrl
        ? `Rejoins maintenant le groupe WhatsApp de la formation. C'est là que le formateur donne l'adresse exacte, le déroulé de la 1re séance et la façon de régler ta préinscription de ${formatFcfa(formation.registrationFee)}.`
        : `Écris maintenant au formateur sur WhatsApp : il t'ajoute au groupe de la formation, où il donne l'adresse exacte, le déroulé de la 1re séance et la façon de régler ta préinscription de ${formatFcfa(formation.registrationFee)}.`,
      "Ta place est réservée dès que le formateur valide ta préinscription. Tu reçois alors un email pour créer ton mot de passe et ouvrir ton espace apprenant.",
    ],
    button: groupButton(input.groupUrl),
    footnote: groupFootnote,
  });
}

export function registrationReminderEmail(input: { firstname: string; scheduleLabel: string; groupUrl: string | null }) {
  return message("As-tu rejoint le groupe WhatsApp FORGE IA ?", {
    title: "Rejoins le groupe WhatsApp",
    paragraphs: [
      hello(input.firstname),
      `Tu es inscrit à la formation FORGE IA (${input.scheduleLabel}), qui commence le ${formation.startLabel}. Ta place n'est pas encore réservée : il reste à régler ta préinscription de ${formatFcfa(formation.registrationFee)} au formateur.`,
      "Tout se passe dans le groupe WhatsApp de la formation : l'adresse exacte, le déroulé de la 1re séance et le paiement de la préinscription.",
    ],
    button: groupButton(input.groupUrl),
    footnote: groupFootnote,
  });
}

export function registrationConfirmedEmail(input: {
  firstname: string;
  scheduleLabel: string;
  groupUrl: string | null;
  /** Lien pour créer le mot de passe, quand l'apprenant n'en a pas encore (inscription sans mot de passe). */
  passwordUrl?: string;
}) {
  return message("Bienvenue dans FORGE IA : ta place est réservée", {
    title: "Ta place est réservée",
    paragraphs: [
      hello(input.firstname),
      `Ta préinscription à la formation FORGE IA (${input.scheduleLabel}) est validée. Ton espace apprenant est ouvert : tu y trouves de quoi préparer la 1re séance.`,
      ...(input.passwordUrl ? ["Pour y entrer, crée d'abord ton mot de passe avec le bouton ci-dessous."] : []),
      ...(input.groupUrl ? [`Si ce n'est pas déjà fait, rejoins le groupe WhatsApp de la formation : ${input.groupUrl}`] : []),
      `Ton reçu est disponible ici : ${siteOrigin}/espace/paiements/recu/registration`,
    ],
    button: input.passwordUrl
      ? { label: "Créer mon mot de passe", url: input.passwordUrl }
      : { label: "Accéder à mon espace", url: `${siteOrigin}/espace` },
    ...(input.passwordUrl
      ? { footnote: "Ce lien est valable 7 jours. Ensuite, utilise « Mot de passe oublié » sur la page de connexion." }
      : {}),
  });
}

export function paymentReceivedEmail(input: { firstname: string; label: string; amount: number; kind: string }) {
  return message(`Paiement reçu : ${input.label}`, {
    title: "Paiement reçu, merci !",
    paragraphs: [
      hello(input.firstname),
      `Nous avons bien reçu ton paiement « ${input.label} » de ${formatFcfa(input.amount)}. Ton échéancier est à jour.`,
      `Ton reçu : ${siteOrigin}/espace/paiements/recu/${input.kind}`,
    ],
    button: { label: "Voir mes paiements", url: `${siteOrigin}/espace/paiements` },
  });
}

export function coinsCreditedEmail(input: { firstname: string; coins: number; amount: string }) {
  return message(`+${input.coins} coins sur ton portefeuille FORGE IA`, {
    title: "Ton portefeuille est rechargé",
    paragraphs: [
      hello(input.firstname),
      `${input.coins} coins ont été ajoutés à ton portefeuille (${input.amount}). Tu peux les utiliser dès maintenant.`,
    ],
    button: { label: "Ouvrir les ressources", url: `${siteOrigin}/espace/ressources` },
  });
}

export function paymentReminderEmail(input: { firstname: string; scheduleLabel: string }) {
  return message("Une échéance FORGE IA est à régler", {
    title: "Une échéance est à régler",
    paragraphs: [
      hello(input.firstname),
      `Une échéance de ta formation FORGE IA (${input.scheduleLabel}) est à régler. Tu peux la payer depuis ton espace apprenant.`,
    ],
    button: { label: "Voir mes paiements", url: `${siteOrigin}/espace/paiements` },
  });
}

export function trainerMessageEmail(input: { firstname: string; message: string }) {
  return message("Un message de ton formateur FORGE IA", {
    title: "Message de ton formateur",
    paragraphs: [hello(input.firstname), ...input.message.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)],
    button: { label: "Ouvrir mon espace", url: `${siteOrigin}/espace` },
  });
}

export function passwordLinkEmail(input: {
  firstname: string;
  url: string;
  purpose: "reset" | "setup";
  /** Durée du lien, écrite dans l'email (1 heure par défaut, 7 jours pour un premier mot de passe). */
  validity?: string;
}) {
  const setup = input.purpose === "setup";
  return message(setup ? "Crée ton mot de passe FORGE IA" : "Réinitialise ton mot de passe FORGE IA", {
    title: setup ? "Crée ton mot de passe" : "Nouveau mot de passe",
    paragraphs: [
      hello(input.firstname),
      setup
        ? "Ton espace FORGE IA se connecte désormais avec ton email et un mot de passe. Clique sur le bouton pour créer le tien."
        : "Tu as demandé à changer ton mot de passe FORGE IA. Clique sur le bouton pour en choisir un nouveau.",
    ],
    button: { label: setup ? "Créer mon mot de passe" : "Choisir un nouveau mot de passe", url: input.url },
    footnote: `Ce lien est valable ${input.validity ?? "1 heure"}. Si tu n'es pas à l'origine de cette demande, ignore ce message.`,
  });
}

export function newContentEmail(input: { kind: string; title: string }) {
  return message(`Nouveau sur FORGE IA : ${input.title}`, {
    title: "Nouveau contenu disponible",
    paragraphs: [`Un nouveau contenu (${input.kind}) est publié dans ton espace : « ${input.title} ».`],
    button: { label: "Le découvrir", url: `${siteOrigin}/espace` },
  });
}

export function projectReviewedEmail(input: {
  firstname: string;
  title: string;
  approved: boolean;
  score: number | null;
  feedback: string;
}) {
  const feedback = input.feedback.trim();
  return message(`Ton projet « ${input.title} » a été évalué`, {
    title: input.approved ? "Projet validé" : "Modifications demandées",
    paragraphs: [
      hello(input.firstname),
      `Ton projet « ${input.title} » a été évalué : ${input.approved ? "validé" : "modifications demandées"}.`,
      ...(input.score !== null ? [`Note : ${input.score}/100.`] : []),
      ...(feedback ? [`Commentaire du formateur : « ${feedback} »`] : []),
    ],
    button: { label: "Voir mes projets", url: `${siteOrigin}/espace/projets` },
  });
}

export function adminAlertEmail(title: string, lines: [string, string][]) {
  return message(`[FORGE IA] ${title}`, {
    title,
    paragraphs: lines.map(([label, value]) => `${label} : ${value}`),
    button: { label: "Ouvrir l'admin", url: `${siteOrigin}/admin` },
  });
}
