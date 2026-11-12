export const brand = {
  name: "FORGE IA",
  tagline: "Créez. Vendez. Gagnez avec l'IA.",
  shortDescription:
    "Formation en présentiel à Godomey : apprends à créer des sites, des applications et des SaaS avec l'IA, sans savoir coder, et à les vendre.",
} as const;

export const trainer = {
  name: "Christian GUEGUELIGUE",
  role: "Fondateur de GUELICHWEB · développeur full-stack et formateur",
  photo: "/formateur-christian.webp",
  portfolioUrl: "https://gchristian.online/",
  bio: "Plus de 11 ans d'expérience dans le web : sites, applications, plateformes et automatisations IA pour des entreprises et des institutions au Bénin. À FORGE IA, il te transmet sa méthode pour faire travailler l'IA, livrer vite et proprement, puis vendre ce que tu construis.",
  facts: [
    "Fondateur de l'agence GUELICHWEB depuis 2023",
    "Formateur depuis 2022 (WordPress, copywriting, vidéo), en présentiel et à distance",
    "Consultant digital pour l'Alliance Bioversity-CIAT depuis 2017",
    "Cette plateforme FORGE IA, il l'a construite avec les outils que tu vas apprendre",
  ],
  /** Réalisations du formateur pour ses clients, montrées sur la page d'accueil (captures dans public/realisations). */
  works: [
    { name: "BUSCORD", kind: "Site d'un bureau d'études, au Burkina Faso", image: "/realisations/buscord.webp", width: 1200, height: 676 },
    { name: "OPENWAY", kind: "Site d'une association, avec prise de rendez-vous", image: "/realisations/openway.webp", width: 1200, height: 900 },
    { name: "Société de Nutrition du Bénin", kind: "Site institutionnel", image: "/realisations/snb.webp", width: 1200, height: 900 },
    { name: "Spass mit Deutsch Bénin", kind: "Site d'un centre de formation", image: "/realisations/spass-site.webp", width: 960, height: 720 },
    { name: "Spass mit Deutsch Bénin", kind: "Application : résultats d'examen en ligne", image: "/realisations/spass-resultats.webp", width: 1200, height: 676 },
    { name: "ExcelTools", kind: "Application en ligne : outils Excel et CSV", image: "/realisations/exceltools.webp", width: 1200, height: 800 },
  ],
} as const;

export const contact = {
  whatsapp: "+22966368705",
  whatsappDigits: "22966368705",
  get whatsappUrl() {
    const text = encodeURIComponent(
      "Bonjour, je souhaite plus de renseignements sur la formation FORGE IA.",
    );
    return `https://wa.me/${this.whatsappDigits}?text=${text}`;
  },
} as const;

export const formation = {
  id: "forge-ia-2026-q4",
  title: "Créer et vendre avec l'IA",
  subtitle: "SaaS · Applications · Sites web · Monétisation",
  startLabel: "28 novembre 2026",
  /** Premier jour de la cohorte, pour le compte à rebours. */
  startDate: "2026-11-28",
  /** Dernier jour : présentation des projets et remise des certificats. */
  endLabel: "16 janvier 2027",
  durationMonths: 2,
  sessionsCount: 6,
  location: "Présentiel à Godomey",
  seatsHint: "20 places maximum",
  /** Places maximum par classe (créneau). Au-delà, le créneau est affiché complet. */
  maxPerClass: 20,
  /**
   * Classes ouvertes à l'inscription pour cette cohorte. Les autres créneaux restent connus du site
   * (comptes et séances existants) mais ne sont plus proposés. Pour en rouvrir un, l'ajouter ici et
   * relire les textes de dates plus bas, écrits pour le samedi.
   */
  openSchedules: ["saturday"] as ReadonlyArray<"saturday" | "saturday_pm" | "sunday">,
  classPolicy: "Une seule classe pour cette cohorte : le samedi matin, 20 places maximum.",
  /** Garantie reprise des conditions d'utilisation (article « Annulation et remboursement »). */
  refundGuarantee:
    "Si la formation est annulée, ou reportée à une date qui ne te convient pas, tout ce que tu as payé t'est remboursé, préinscription comprise.",
  /** Prix de vente d'un site au Bénin, en FCFA : ce sont les tarifs pratiqués par le formateur. */
  sitePrice: { from: 125_000, to: 350_000 },
  currency: "XOF",
  currencyLabel: "FCFA",
  totalPrice: 80_000,
  // Crédit IA inclus pour chaque apprenant (passerelle IA FORGE IA), modifiable par apprenant dans l'admin.
  iaBudgetFcfa: 5_000,
  // Préinscription obligatoire : réserve la place dans le créneau choisi.
  registrationFee: 2_500,
  schedule: {
    saturday: { id: "saturday" as const, label: "Samedi matin", hours: "9h – 13h30" },
    saturday_pm: { id: "saturday_pm" as const, label: "Samedi après-midi", hours: "16h – 20h30" },
    sunday: { id: "sunday" as const, label: "Dimanche matin", hours: "9h – 13h30" },
  },
  installments: [
    {
      id: "start",
      label: "Au démarrage",
      amount: 30_000,
      due: "Premier jour de formation (samedi 28 novembre 2026)",
      dueDate: "2026-11-28",
    },
    {
      id: "month1",
      label: "Solde",
      amount: 47_500,
      due: "4e séance, avant la pause des fêtes (samedi 19 décembre 2026)",
      dueDate: "2026-12-19",
    },
  ],
  // Textes de la page d'accueil : des mots que comprend quelqu'un qui n'a jamais codé.
  outcomes: [
    "Transformer un modèle de design en vrai site en ligne",
    "Refaire un vieux site en site moderne et rapide",
    "Lancer ta propre application en ligne, avec paiement Mobile Money",
    "Faire écrire le code par l'IA, avec les outils des professionnels",
    "Trouver tes premiers clients et fixer tes prix",
  ],
  /** Les 3 projets que chaque apprenant met en ligne pendant la formation. */
  projects: [
    { title: "Une page de vente", text: "Un modèle de design transformé en vraie page qui vend un produit ou un service." },
    { title: "Un site d'entreprise", text: "Un site moderne, rapide et facile à faire évoluer, comme ceux que commandent les clients." },
    { title: "Ton application en ligne", text: "Avec des comptes clients, une base de données et le paiement Mobile Money." },
  ],
  included: [
    "6 séances de 4 h 30 en présentiel, avec le formateur",
    "Ton espace en ligne : cours, modèles de consignes pour l'IA, codes et tests publiés au fil des séances",
    "Le groupe WhatsApp de la cohorte pour t'entraider entre les séances",
    "La revue de tes projets par le formateur",
    "La présentation finale de ton projet, ton offre commerciale et ton certificat",
  ],
  months: [
    {
      month: "Partie 1 — Novembre et décembre",
      focus: "Tes deux premiers sites",
      points: [
        "Tu installes tes outils d'IA et tu crées dès la première séance",
        "Projet 1 : ta page de vente, à partir d'un modèle de design",
        "Projet 2 : un site d'entreprise complet, mis en ligne",
        "Projet 3 : tu démarres ton application en ligne",
        "4 samedis : 28 novembre, 5, 12 et 19 décembre",
      ],
    },
    {
      month: "Partie 2 — Janvier, après les fêtes",
      focus: "Ton application et ton offre",
      points: [
        "Ton application encaisse : paiement Mobile Money et mise en ligne",
        "Corriger les erreurs et livrer comme un professionnel",
        "Le 16 janvier : tu présentes ton projet et tu repars avec ton offre commerciale et ton certificat",
        "2 samedis : 9 et 16 janvier 2027",
      ],
    },
  ],
  // Montants écrits avec des espaces insécables ( ) : ils ne se coupent pas en fin de ligne.
  faq: [
    {
      q: "Faut-il savoir coder ?",
      a: "Non. On part de zéro : l'IA écrit le code, tu apprends à la guider, à vérifier ce qu'elle produit et à mettre ton projet en ligne.",
    },
    {
      q: "Faut-il venir avec un ordinateur ?",
      a: "Oui. Viens avec ton ordinateur portable chargé : on travaille dessus à chaque séance et on installe les outils ensemble dès la première.",
    },
    {
      q: "Quels outils va-t-on utiliser ?",
      a: "Des outils d'IA utilisés par les professionnels : Cursor, Antigravity et Claude Code. On les installe ensemble à la première séance.",
    },
    {
      q: "La formation est-elle en ligne ?",
      a: "Non. Elle se déroule en présentiel. Ton espace en ligne sert à retrouver les cours, les outils, les codes et les tests au fil des séances.",
    },
    {
      q: "Quels sont les jours et les horaires ?",
      a: "Le samedi matin, de 9h à 13h30. 6 séances, du 28 novembre 2026 au 16 janvier 2027, avec une pause pendant les fêtes : 4 samedis avant Noël (28 novembre, 5, 12 et 19 décembre), puis 2 en janvier (9 et 16 janvier).",
    },
    {
      q: "Combien de places ?",
      a: "20 personnes maximum, pour que le formateur ait le temps de suivre chacun. Quand la classe est complète, les inscriptions ferment.",
    },
    {
      q: "À quoi sert la préinscription de 2 500 F ?",
      a: "Elle réserve ta place et t'ouvre ton espace apprenant et le groupe WhatsApp de la cohorte. Le paiement se fait par Mobile Money. Elle n'est pas remboursable si tu changes d'avis.",
    },
    {
      q: "Et si la formation est annulée ou reportée ?",
      a: "Tu es remboursé intégralement, préinscription comprise, si la formation est annulée ou si la nouvelle date ne te convient pas. C'est écrit dans nos conditions d'utilisation.",
    },
    {
      q: "Où se déroule la formation ?",
      a: "En présentiel à Godomey. L'adresse exacte est communiquée aux inscrits avant la première séance.",
    },
    {
      q: "Comment se paie le reste de la formation ?",
      a: "Total 80 000 F. Après la préinscription (2 500 F) : 30 000 F le premier jour de formation, puis le solde de 47 500 F à la 4e séance (samedi 19 décembre), avant la pause des fêtes.",
    },
    {
      q: "Comment je reçois les cours et les annonces ?",
      a: "Les cours, les codes et les tests sont publiés dans ton espace au fil des séances. Tu reçois un email à chaque nouveauté, et les annonces passent aussi par le groupe WhatsApp de la cohorte.",
    },
  ],
} as const;

export type ScheduleId = keyof typeof formation.schedule;

/** Classes proposées à l'inscription, dans l'ordre d'affichage. */
export const openSlots = formation.openSchedules.map((id) => formation.schedule[id]);
