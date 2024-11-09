export default {
  transaction_methods: {
    card_purchase: "カード購入",
    payment: "支払い",
    card_atm: "カードATM",
    transfer: "振込",
    other: "その他",
    ach: "Ach",
    deposit: "預金",
    wire: "電信送金",
    fee: "手数料",
    interest: "利息",
  },
  language: {
    title: "言語",
    description: "ユーザーインターフェースで使用する言語を変更します。",
    placeholder: "言語を選択",
  },
  languages: {
    en: "英語",
    fr: "フランス語",
    fa: "ペルシャ語",
    it: "イタリア語",
    ja: "日本語",
  },
  timezone: {
    title: "タイムゾーン",
    description: "現在のタイムゾーン設定。",
    placeholder: "タイムゾーンを選択",
  },
  inbox_filter: {
    all: "すべて",
    todo: "やること",
    done: "完了済み",
  },
  spending_period: {
    last_30d: "過去30日間",
    this_month: "今月",
    last_month: "先月",
    this_year: "今年",
    last_year: "昨年",
  },
  transactions_period: {
    all: "すべて",
    income: "収入",
    outcome: "支出",
  },
  chart_type: {
    profit: "利益",
    revenue: "収益",
    burn_rate: "消費率",
  },
  folders: {
    all: "すべて",
    exports: "エクスポート",
    inbox: "受信箱",
    imports: "インポート",
    transactions: "取引",
  },
  mfa_status: {
    verified: "確認済み",
    unverified: "未確認",
  },
  roles: {
    owner: "オーナー",
    member: "メンバー",
  },
  travel_status: {
    in_progress: "進行中",
    completed: "完了済み",
  },
} as const;
