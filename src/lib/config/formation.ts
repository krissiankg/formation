export const brand = {
  name: "FORGE IA",
  tagline: "Créez. Vendez. Gagnez avec l'IA.",
  shortDescription:
    "Formation présentielle pour apprendre à créer des SaaS, applications et sites internet avec l'IA — et en vivre.",
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
  endLabel: "20 décembre 2026",
  durationMonths: 2,
  sessionsCount: 6,
  location: "Présentiel — le lieu exact est communiqué avant la première séance",
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
    "Transformer un template UI8 ou Figma en vrai site avec l'IA",
    "Recoder un thème WordPress en site moderne et rapide",
    "Construire ton propre SaaS avec paiement Mobile Money",
    "Maîtriser Cursor, Claude Code et Antigravity",
    "Vendre tes services et ton produit",
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
  ],  faq: [
    {
      q: "La formation est-elle en ligne ?",
      a: "Non. Elle se déroule en présentiel. L'application sert à récupérer le programme, les outils, les codes et les ressources au fur et à mesure.",
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
      a: "Elle est obligatoire et réserve ta place dans le créneau choisi. Le paiement se fait par Mobile Money. Elle n'est pas remboursable.",
    },
    {
      q: "Où se déroule la formation ?",
      a: "En présentiel. Le lieu exact est communiqué aux inscrits avant la première séance.",
    },
    {
      q: "Comment se paie le reste de la formation ?",
      a: "Total 80 000 F. Après la préinscription (2 500 F) : 30 000 F le premier jour de formation, puis le solde de 47 500 F à la première séance de décembre.",
    },
    {
      q: "Pourquoi un compte sur la plateforme ?",
      a: "Les outils, prompts, codes et tests sont publiés progressivement. Tu seras notifié sur WhatsApp pour te connecter et les récupérer.",
    },
  ],
} as const;

export type ScheduleId = keyof typeof formation.schedule;
