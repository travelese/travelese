export default {
  transaction_methods: {
    card_purchase: "خرید با کارت",
    payment: "پرداخت",
    card_atm: "کارت خودپرداز",
    transfer: "انتقال",
    other: "دیگر",
    ach: "اچ",
    deposit: "سپرده",
    wire: "حواله بانکی",
    fee: "هزینه",
    interest: "بهره",
  },
  language: {
    title: "زبان",
    description: "تغییر زبان مورد استفاده در رابط کاربری.",
    placeholder: "انتخاب زبان",
  },
  languages: {
    en: "انگلیسی",
    fr: "فرانسوی",
    fa: "فارسی",
    it: "ایتالیایی",
    ja: "ژاپنی",
  },
  timezone: {
    title: "منطقه زمانی",
    description: "تنظیمات فعلی منطقه زمانی.",
    placeholder: "انتخاب منطقه زمانی",
  },
  inbox_filter: {
    all: "همه",
    todo: "کارها",
    done: "انجام شده",
  },
  spending_period: {
    last_30d: "۳۰ روز گذشته",
    this_month: "این ماه",
    last_month: "ماه گذشته",
    this_year: "امسال",
    last_year: "سال گذشته",
  },
  transactions_period: {
    all: "همه",
    income: "درآمد",
    outcome: "هزینه‌ها",
  },
  chart_type: {
    profit: "سود",
    revenue: "درآمد",
    burn_rate: "نرخ مصرفی",
  },
  folders: {
    all: "همه",
    exports: "صادرات",
    inbox: "صندوق ورودی",
    imports: "واردات",
    transactions: "تراکنش‌ها",
  },
  mfa_status: {
    verified: "تأیید شده",
    unverified: "تأیید نشده",
  },
  roles: {
    owner: "مالک",
    member: "عضو",
  },
  travel_status: {
    in_progress: "در حال پیشرفت",
    completed: "تکمیل شده",
  },
} as const;
