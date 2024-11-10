export default {
  transaction_methods: {
    card_purchase: "Achat par carte",
    payment: "Paiement",
    card_atm: "Carte distributeur",
    transfer: "Virement",
    other: "Autre",
    ach: "Ach",
    deposit: "Dépôt",
    wire: "Virement bancaire",
    fee: "Frais",
    interest: "Intérêt",
  },
  language: {
    title: "Langue",
    description: "Changer la langue utilisée dans l'interface utilisateur.",
    placeholder: "Choisir la langue",
  },
  languages: {
    en: "Anglais",
    fr: "Français",
    fa: "Persan",
    it: "Italien",
    ja: "Japonais",
  },
  timezone: {
    title: "Fuseau horaire",
    description: "Paramètre actuel du fuseau horaire.",
    placeholder: "Choisir le fuseau horaire",
  },
  inbox_filter: {
    all: "Tous",
    todo: "À faire",
    done: "Terminé",
  },
  spending_period: {
    last_30d: "Les 30 derniers jours",
    this_month: "Ce mois-ci",
    last_month: "Le mois dernier",
    this_year: "Cette année",
    last_year: "L'année dernière",
  },
  transactions_period: {
    all: "Tout",
    income: "Revenu",
    outcome: "Dépenses",
  },
  chart_type: {
    profit: "Profit",
    revenue: "Revenu",
    burn_rate: "Taux de consommation",
  },
  folders: {
    all: "Tous",
    exports: "Exportations",
    inbox: "Boîte de réception",
    imports: "Importations",
    transactions: "Transactions",
  },
  mfa_status: {
    verified: "Vérifié",
    unverified: "Non vérifié",
  },
  roles: {
    owner: "Propriétaire",
    member: "Membre",
  },
  travel_status: {
    in_progress: "En cours",
    completed: "Terminé",
  },
} as const;
