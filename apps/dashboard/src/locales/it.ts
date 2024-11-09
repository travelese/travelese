export default {
  transaction_methods: {
    card_purchase: "Acquisto con carta",
    payment: "Pagamento",
    card_atm: "Carta bancomat",
    transfer: "Trasferimento",
    other: "Altro",
    ach: "Ach",
    deposit: "Deposito",
    wire: "Bonifico bancario",
    fee: "Tassa",
    interest: "Interesse",
  },
  language: {
    title: "Lingua",
    description: "Cambia la lingua utilizzata nell'interfaccia utente.",
    placeholder: "Seleziona la lingua",
  },
  languages: {
    en: "Inglese",
    fr: "Francese",
    fa: "Persiano",
    it: "Italiano",
    ja: "Giapponese",
  },
  timezone: {
    title: "Fuso orario",
    description: "Impostazione attuale del fuso orario.",
    placeholder: "Seleziona il fuso orario",
  },
  inbox_filter: {
    all: "Tutti",
    todo: "Da fare",
    done: "Completato",
  },
  spending_period: {
    last_30d: "Ultimi 30 giorni",
    this_month: "Questo mese",
    last_month: "Il mese scorso",
    this_year: "Quest'anno",
    last_year: "L'anno scorso",
  },
  transactions_period: {
    all: "Tutto",
    income: "Reddito",
    outcome: "Spese",
  },
  chart_type: {
    profit: "Profitto",
    revenue: "Entrate",
    burn_rate: "Tasso di consumo",
  },
  folders: {
    all: "Tutti",
    burn_rate: "Tasso di consumo",
  },
  exports: "Esportazioni",
  inbox: "Inbox",
  imports: "Importazioni",
  transactions: "Transazioni",
  mfa_status: {
    verified: "Verificato",
    unverified: "Non verificato",
  },
  roles: {
    owner: "Proprietario",
    member: "Membro",
  },
  travel_status: {
    in_progress: "In corso",
    completed: "Completato",
  },
} as const;
