export const brand = {
  name: "FORGE IA",
  tagline: "Créez. Vendez. Gagnez avec l'IA.",
  shortDescription:
    "Formation en présentiel à Cotonou : apprends à créer des sites, des applications et des SaaS avec l'IA, sans savoir coder, et à les vendre.",
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
  projects: ["BUSCORD", "Société de Nutrition du Bénin", "Spass mit Deutsch Bénin", "ExcelTools"],
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
  startLabel: "14 novembre 2026",
  /** Premier jour de la cohorte (classes du samedi), pour le compte à rebours. */
  startDate: "2026-11-14",
  endLabel: "20 décembre 2026",
  durationMonths: 2,
  sessionsCount: 6,
  location: "Présentiel à Cotonou — l'adresse exacte est communiquée avant la première séance",
  seatsHint: "20 places maximum par classe",
  /** Places maximum par classe (créneau). Au-delà, le créneau est affiché complet. */
  maxPerClass: 20,
  classPolicy:
    "Chaque classe est limitée à 20 personnes. Si une classe n'atteint pas le nombre minimum d'inscrits, les classes seront fusionnées et tu seras prévenu à l'avance.",
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
      due: "Premier jour de formation (14 ou 15 novembre 2026)",
      dueDate: "2026-11-14",
    },
    {
      id: "month1",
      label: "Solde",
      amount: 47_500,
      due: "Première séance de décembre (5 ou 6 décembre 2026)",
      dueDate: "2026-12-05",
    },
  ],
  outcomes: [
    "Transformer une maquette Figma ou UI8 en vrai site en ligne",
    "Recoder un vieux site WordPress en site moderne et rapide",
    "Lancer ton propre SaaS avec paiement Mobile Money",
    "Faire coder l'IA à ta place avec Cursor, Claude Code et Antigravity",
    "Trouver tes premiers clients et fixer tes prix",
  ],
  /** Les 3 projets que chaque apprenant met en ligne pendant la formation. */
  projects: [
    { title: "Une landing page", text: "Une maquette Figma ou UI8 transformée en vraie page de vente, en ligne." },
    { title: "Un site vitrine", text: "Un thème WordPress recodé en site moderne, rapide et facile à faire évoluer." },
    { title: "Ton SaaS", text: "Ton application avec comptes, base de données et paiement Mobile Money." },
  ],
  included: [
    "6 séances de 4 h 30 en présentiel, avec le formateur",
    "Ton espace en ligne : cours, prompts, codes et tests publiés au fil des séances",
    "Le groupe WhatsApp de la cohorte pour t'entraider entre les séances",
    "La revue de tes projets par le formateur",
    "Le Demo Day, ton offre commerciale et ton certificat",
  ],
  months: [
    {
      month: "Mois 1 — Novembre",
      focus: "La méthode ADAPT sur de vrais sites",
      points: [
        "Ton atelier IA : Cursor, Antigravity, Claude Code",
        "Projet 1 : un template UI8 / Figma transformé en landing page",
        "Projet 2 : un thème WordPress recodé en site vitrine",
        "3 séances : 14, 21 et 28 novembre (ou le lendemain pour la classe du dimanche)",
      ],
    },
    {
      month: "Mois 2 — Décembre",
      focus: "Ton SaaS et ton offre",
      points: [
        "Projet 3 : ton SaaS avec base de données et paiement Mobile Money",
        "Déboguer et livrer comme un pro avec l'IA, puis VS Code + Cline",
        "Demo Day le 19 décembre (20 pour le dimanche), offre commerciale et certificat",
        "3 séances : 5, 12 et 19 décembre (ou le lendemain pour la classe du dimanche)",
      ],
    },
  ],
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
      q: "La formation est-elle en ligne ?",
      a: "Non. Elle se déroule en présentiel. Ton espace en ligne sert à retrouver les cours, les outils, les codes et les tests au fil des séances.",
    },
    {
      q: "Quels sont les créneaux ?",
      a: "Trois classes au choix, à la préinscription : samedi matin (9h – 13h30), samedi après-midi (16h – 20h30) ou dimanche matin (9h – 13h30). 6 séances, du 14 novembre au 19 décembre 2026 (le lendemain pour la classe du dimanche).",
    },
    {
      q: "Combien de places par classe ?",
      a: "20 personnes maximum par classe : un créneau complet n'est plus proposé. Si une classe n'atteint pas le nombre minimum d'inscrits, les classes seront fusionnées et tu seras prévenu à l'avance.",
    },
    {
      q: "À quoi sert la préinscription de 2 500 F ?",
      a: "Elle réserve ta place dans la classe choisie et t'ouvre ton espace apprenant et le groupe WhatsApp de la cohorte. Le paiement se fait par Mobile Money. Elle n'est pas remboursable.",
    },
    {
      q: "Où se déroule la formation ?",
      a: "En présentiel à Cotonou. L'adresse exacte est communiquée aux inscrits avant la première séance.",
    },
    {
      q: "Comment se paie le reste de la formation ?",
      a: "Total 80 000 F. Après la préinscription (2 500 F) : 30 000 F le premier jour de formation, puis le solde de 47 500 F à la première séance de décembre.",
    },
    {
      q: "Comment je reçois les cours et les annonces ?",
      a: "Les cours, prompts, codes et tests sont publiés dans ton espace au fil des séances. Tu reçois un email à chaque nouveauté, et les annonces passent aussi par le groupe WhatsApp de la cohorte.",
    },
  ],
} as const;

export type ScheduleId = keyof typeof formation.schedule;
