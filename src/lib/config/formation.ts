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
  startLabel: "Octobre 2026",
  endLabel: "Décembre 2026",
  durationMonths: 3,
  location: "Présentiel — lieu à confirmer",
  seatsHint: "Places limitées par créneau",
  currency: "XOF",
  currencyLabel: "FCFA",
  totalPrice: 145_000,
  registrationFee: 5_000,
  schedule: {
    saturday: { id: "saturday" as const, label: "Tous les samedis", hours: "9h – 14h" },
    sunday: { id: "sunday" as const, label: "Tous les dimanches", hours: "9h – 14h" },
  },
  installments: [
    {
      id: "start",
      label: "Au démarrage",
      amount: 70_000,
      due: "Début de formation (octobre 2026)",
    },
    {
      id: "month1",
      label: "Fin du 1er mois",
      amount: 50_000,
      due: "Fin octobre / début novembre 2026",
    },
    {
      id: "month3",
      label: "Début du 3e mois",
      amount: 20_000,
      due: "Début décembre 2026",
      note: "Solde restant (ajustable)",
    },
  ],
  outcomes: [
    "Créer un SaaS ou une application avec l'IA",
    "Construire et publier un site internet pro",
    "Packager et vendre ton produit digital",
    "Mettre en place des automatisations utiles",
  ],
  months: [
    {
      month: "Mois 1 — Octobre",
      focus: "Fondations & premiers produits",
      points: [
        "Maîtriser les outils IA pour builder",
        "Passer d'une idée à un MVP",
        "Premiers sites et interfaces",
      ],
    },
    {
      month: "Mois 2 — Novembre",
      focus: "Produit & monétisation",
      points: [
        "SaaS et apps plus complets",
        "Paiements, onboarding, livraison",
        "Positionnement et offre commerciale",
      ],
    },
    {
      month: "Mois 3 — Décembre",
      focus: "Vente & autonomie",
      points: [
        "Lancer et vendre concrètement",
        "Automatiser ta stack",
        "Plan pour vivre de tes créations",
      ],
    },
  ],
  faq: [
    {
      q: "La formation est-elle en ligne ?",
      a: "Non. Elle se déroule en présentiel. L'application sert à récupérer le programme, les outils, les codes et les ressources au fur et à mesure.",
    },
    {
      q: "Dois-je choisir samedi ou dimanche ?",
      a: "Oui, au moment de l'inscription. Un seul créneau : tous les samedis ou tous les dimanches, de 9h à 14h.",
    },
    {
      q: "À quoi servent les 5 000 F d'inscription ?",
      a: "Ils réservent ta place lors du remplissage du formulaire. Le paiement se fait par Mobile Money.",
    },
    {
      q: "Comment se paie le reste de la formation ?",
      a: "Total 145 000 F. Après les frais d'inscription : 70 000 F au démarrage, 50 000 F à la fin du 1er mois, puis le solde au début du 3e mois.",
    },
    {
      q: "Pourquoi un compte sur la plateforme ?",
      a: "Les outils, prompts, codes et tests sont publiés progressivement. Tu seras notifié sur WhatsApp pour te connecter et les récupérer.",
    },
  ],
} as const;

export type ScheduleId = keyof typeof formation.schedule;
