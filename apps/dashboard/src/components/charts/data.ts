import { getColorFromName } from "@/utils/categories";

export const chartExampleData = {
  summary: {
    currency: "CAD",
    currentTotal: 420.69,
    prevTotal: 69.42,
  },
  meta: {
    type: "profit",
    period: "monthly",
    currency: "CAD",
  },
  result: [
    {
      date: "Sun Jan 01 2024",
      previous: {
        date: "2023-1-1",
        currency: "USD",
        value: 69.42,
      },
      current: {
        date: "2024-1-1",
        currency: "CAD",
        value: 420.69,
      },
      precentage: {
        currency: "CAD",
        value: 110,
        status: "positive",
      },
    },
  ],
};

export const spendingExampleData = {
  meta: {
    count: 100,
    totalAmount: 234234,
    currency: "USD",
  },
  data: [
    {
      slug: "flight",
      color: getColorFromName("Flight"),
      name: "Flight",
      currency: "CAD",
      amount: 0,
      precentage: 0,
    },
    {
      slug: "stay",
      color: getColorFromName("Stay"),
      name: "Stay",
      currency: "CAD",
      amount: 0,
      precentage: 0,
    },
    {
      slug: "fees",
      color: getColorFromName("Fees"),
      name: "Fees",
      currency: "CAD",
      amount: 0,
      precentage: 0,
    },
    {
      slug: "travel",
      color: getColorFromName("Travel"),
      name: "Travel",
      currency: "CAD",
      amount: 0,
      precentage: 0,
    },
    {
      slug: "uncategorized",
      color: getColorFromName("Uncategorized"),
      name: "Uncategorized",
      currency: "CAD",
      amount: 0,
      precentage: 0,
    },
  ],
};

export const transactionExampleData = {
  data: [{ id: 1, name: "X", amount: -69, currency: "CAD" }],
};

export const expenseChartExampleData = {
  summary: {
    currency: "CAD",
    averageExpense: 420.69,
  },
  meta: {
    type: "expense",
    period: "monthly",
    currency: "CAD",
  },
  result: [
    {
      date: "2023-01-01",
      total: {
        value: 666,
        currency: "CAD",
      },
      recurring: {
        value: 666,
        currency: "CAD",
      },
    },
  ],
};

export const burnRateExamleData = [
  {
    data: [{ value: 666, date: "2024-01-01", currency: "CAD" }],
  },
  { data: 1 },
];
