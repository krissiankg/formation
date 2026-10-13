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
  startLabel: "31 octobre 2026",
  endLabel: "20 décembre 2026",
  durationMonths: 2,
  location: "Présentiel — lieu à confirmer",
  seatsHint: "Places limitées par créneau",
  currency: "XOF",
  currencyLabel: "FCFA",
  totalPrice: 80_000,
  registrationFee: 5_000,
  schedule: {
    saturday: { id: "saturday" as const, label: "Tous les samedis", hours: "9h – 13h30" },
    sunday: { id: "sunday" as const, label: "Tous les dimanches", hours: "9h – 13h30" },
  },
  installments: [
    {
      id: "start",
      label: "Au démarrage",
      amount: 25_000,
      due: "Premier jour de formation (31 octobre / 1er novembre 2026)",
    },
    {
      id: "month1",
      label: "Solde",
      amount: 50_000,
      due: "Première semaine de décembre 2026",
    },
  ],
  outcomes: [
    "Transformer un template UI8 ou Figma en vrai site avec l'IA",
    "Recoder un thème WordPress en site moderne et rapide",
    "Construire ton propre SaaS avec paiement Mobile Money",
    "Maîtriser Cursor, Claude Code, Antigravity et FORGEIA CODE",
    "Vendre tes services et ton produit",
  ],
  months: [
    {
      month: "Mois 1 — Novembre",
      focus: "La méthode ADAPT sur de vrais sites",
      points: [
        "Ton atelier IA : Cursor, Claude Code, Antigravity",
        "Projet 1 : un template UI8 / Figma transformé en landing page",
        "Projet 2 : un thème WordPress recodé en site vitrine",
      ],
    },
    {
      month: "Mois 2 — Décembre",
      focus: "Ton SaaS et ton offre",
      points: [
        "Projet 3 : ton SaaS avec base de données et paiement Mobile Money",
        "Déboguer et livrer comme un pro avec l'IA",
        "Demo Day, offre commerciale et certificat",
      ],
    },
  ],  faq: [
    {
      q: "La formation est-elle en ligne ?",
      a: "Non. Elle se déroule en présentiel. L'application sert à récupérer le programme, les outils, les codes et les ressources au fur et à mesure.",
    },
    {
      q: "Dois-je choisir samedi ou dimanche ?",
      a: "Oui, au moment de l'inscription. Un seul créneau : tous les samedis ou tous les dimanches, de 9h à 13h30.",
    },
    {
      q: "À quoi servent les 5 000 F d'inscription ?",
      a: "Ils réservent ta place lors du remplissage du formulaire. Le paiement se fait par Mobile Money.",
    },
    {
      q: "Comment se paie le reste de la formation ?",
      a: "Total 80 000 F. Après les frais d'inscription (5 000 F) : 25 000 F le premier jour de formation, puis le solde de 50 000 F la première semaine de décembre.",
    },
    {
      q: "Pourquoi un compte sur la plateforme ?",
      a: "Les outils, prompts, codes et tests sont publiés progressivement. Tu seras notifié sur WhatsApp pour te connecter et les récupérer.",
    },
  ],
} as const;

export type ScheduleId = keyof typeof formation.schedule;
