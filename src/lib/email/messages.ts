/**
 * Emails envoyés par FORGE IA. Un seul appel à l'action par email.
 */

import type { EmailMessage } from "@/lib/email/brevo";
import { renderEmail } from "@/lib/email/layout";
import { siteOrigin } from "@/lib/config/site";
import { formatFcfa } from "@/lib/format";

function message(subject: string, content: Parameters<typeof renderEmail>[0]): EmailMessage {
  return { subject, ...renderEmail(content) };
}

const hello = (firstname: string) => `Bonjour ${firstname.trim() || "à toi"},`;

export function accountCreatedEmail(input: { firstname: string; scheduleLabel: string; amount: number }) {
  return message("Ton compte FORGE IA est créé", {
    title: "Ton compte est créé",
    paragraphs: [
      hello(input.firstname),
      `Ton compte pour la formation FORGE IA (${input.scheduleLabel}) est bien créé.`,
      `Pour réserver ta place et ouvrir ton espace apprenant, il reste à régler la préinscription de ${formatFcfa(input.amount)}.`,
    ],
    button: { label: "Finaliser ma préinscription", url: `${siteOrigin}/inscription/paiement` },
    footnote: "Si tu as déjà payé, ignore ce message : ton espace s'ouvre dès que FedaPay confirme le paiement.",
  });
}

export function registrationConfirmedEmail(input: { firstname: string; scheduleLabel: string; groupUrl: string | null }) {
  return message("Bienvenue dans FORGE IA : ta place est réservée", {
    title: "Ta place est réservée",
    paragraphs: [
      hello(input.firstname),
      `Ta préinscription à la formation FORGE IA (${input.scheduleLabel}) est payée. Ton espace apprenant est ouvert.`,
      ...(input.groupUrl
        ? ["Rejoins maintenant le groupe WhatsApp FORGEIA : c'est là que passent les annonces de la formation."]
        : []),
      `Ton reçu est disponible ici : ${siteOrigin}/espace/paiements/recu/registration`,
    ],
    button: input.groupUrl
      ? { label: "Rejoindre le groupe WhatsApp", url: input.groupUrl }
      : { label: "Accéder à mon espace", url: `${siteOrigin}/espace` },
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

export function registrationReminderEmail(input: { firstname: string; scheduleLabel: string }) {
  return message("Ta préinscription FORGE IA attend son paiement", {
    title: "Ta place n'est pas encore réservée",
    paragraphs: [
      hello(input.firstname),
      `Ta préinscription à la formation FORGE IA (${input.scheduleLabel}) attend toujours son paiement.`,
      "Pour sécuriser ta place avant la clôture de la cohorte, règle-la depuis ton compte.",
    ],
    button: { label: "Finaliser ma préinscription", url: `${siteOrigin}/inscription/paiement` },
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

export function passwordLinkEmail(input: { firstname: string; url: string; purpose: "reset" | "setup" }) {
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
    footnote: "Ce lien est valable 1 heure. Si tu n'es pas à l'origine de cette demande, ignore ce message.",
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
