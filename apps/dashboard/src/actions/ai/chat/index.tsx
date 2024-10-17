"use server";

import { BotMessage, SpinnerMessage } from "@/components/chat/messages";
import { logger } from "@/utils/logger";
import { openai } from "@ai-sdk/openai";
import { client as RedisClient } from "@travelese/kv";
import { getUser } from "@travelese/supabase/cached-queries";
import { Ratelimit } from "@upstash/ratelimit";
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { startOfMonth, subMonths } from "date-fns";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { getAssistantSettings, saveChat } from "../storage";
import type { AIState, Chat, ClientMessage, UIState } from "../types";
import { getBurnRateTool } from "./tools/burn-rate";
import { createOfferRequestTool } from "./tools/create-offer-request";
import { getForecastTool } from "./tools/forecast";
import { getDocumentsTool } from "./tools/get-documents";
import { getInvoicesTool } from "./tools/get-invoces";
import { getTransactionsTool } from "./tools/get-transactions";
import { getPlaceSuggestionsTools } from "./tools/list-place-suggestions";
import { getProfitTool } from "./tools/profit";
import { createReport } from "./tools/report";
import { getRevenueTool } from "./tools/revenue";
import { getRunwayTool } from "./tools/runway";
import { getSpendingTool } from "./tools/spending";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.fixedWindow(10, "10s"),
  redis: RedisClient,
});

export async function submitUserMessage(
  content: string,
): Promise<ClientMessage> {
  "use server";
  const ip = headers().get("x-forwarded-for");
  const { success } = await ratelimit.limit(ip);

  logger("Submitting user message", { content, ip });

  const aiState = getMutableAIState<typeof AI>();

  if (!success) {
    aiState.update({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: "assistant",
          content:
            "Not so fast, tiger. You've reached your message limit. Please wait a minute and try again.",
        },
      ],
    });

    return {
      id: nanoid(),
      role: "assistant",
      display: (
        <BotMessage content="Not so fast, tiger. You've reached your message limit. Please wait a minute and try again." />
      ),
    };
  }

  const user = await getUser();
  const teamId = user?.data?.team_id as string;

  logger("User context", { userId: user?.data?.id, teamId });

  const defaultValues = {
    from: subMonths(startOfMonth(new Date()), 12).toISOString(),
    to: new Date().toISOString(),
  };

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: "user",
        content,
      },
    ],
  });

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>;
  let textNode: undefined | React.ReactNode;

  const result = await streamUI({
    model: openai("gpt-4o-mini"),
    initial: <SpinnerMessage />,
    system: `\
      You are a helpful assistant in Travelese who can help travellers explore destinations, find the best flights and stays/hotels, and more.
      If the user wants to find place suggestions for travel, call \`getPlaceSuggestions\` function.
      If the user wants to search for flights, call \`createOfferRequestTool\` function with the following parameters:
      - origin: IATA code of the departure airport
      - destination: IATA code of the arrival airport
      - departure_date: in YYYY-MM-DD format
      - return_date: in YYYY-MM-DD format (optional for one-way flights)
      - adults: number of adult passengers
      - children: number of child passengers
      - infants: number of infant passengers
      - cabin_class: economy, premium_economy, business, or first
      If the user wants the burn rate, call \`getBurnRate\` function.
      If the user wants the runway, call \`getRunway\` function.
      If the user wants the profit, call \`getProfit\` function.
      If the user wants to find transactions or expenses, call \`getTransactions\` function.
      If the user wants to see spending based on a category, call \`getSpending\` function.
      If the user wants to find invoices or receipts, call \`getInvoices\` function.
      If the user wants to find documents, call \`getDocuments\` function.

      Always try to call the functions with default values, otherwise ask the user to respond with parameters.
      Current date is: ${new Date().toISOString().split("T")[0]} \n
      `,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name,
        display: null,
      })),
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue("");
        textNode = <BotMessage content={textStream.value} />;
      }

      if (done) {
        textStream.done();
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: "assistant",
              content,
            },
          ],
        });
      } else {
        textStream.update(delta);
      }

      return textNode;
    },
    tools: {
      getSpending: getSpendingTool({
        aiState,
        dateFrom: defaultValues.from,
        dateTo: defaultValues.to,
      }),
      getBurnRate: getBurnRateTool({
        aiState,
        dateFrom: defaultValues.from,
        dateTo: defaultValues.to,
      }),
      getRunway: getRunwayTool({
        aiState,
        dateFrom: defaultValues.from,
        dateTo: defaultValues.to,
      }),
      getProfit: getProfitTool({
        aiState,
        dateFrom: defaultValues.from,
        dateTo: defaultValues.to,
      }),
      getRevenue: getRevenueTool({
        aiState,
        dateFrom: defaultValues.from,
        dateTo: defaultValues.to,
      }),
      getForecast: getForecastTool({
        aiState,
        dateFrom: defaultValues.from,
        dateTo: defaultValues.to,
      }),
      getTransactions: getTransactionsTool({ aiState }),
      getInvoices: getInvoicesTool({ aiState, teamId }),
      getDocuments: getDocumentsTool({ aiState, teamId }),
      createReport: createReport({
        aiState,
        userId: user?.data?.id ?? "",
        teamId,
        dateFrom: defaultValues.from,
        dateTo: defaultValues.to,
      }),
      getPlaceSuggestions: getPlaceSuggestionsTools({
        aiState,
        query: content,
      }),
      createOfferRequest: createOfferRequestTool({ aiState }),
    },
  });

  return {
    id: nanoid(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  onSetAIState: async ({ state, done }) => {
    "use server";

    const settings = await getAssistantSettings();

    const createdAt = new Date();
    const userId = state.user.id;
    const teamId = state.user.team_id;

    const { chatId, messages } = state;

    const firstMessageContent = messages?.at(0)?.content ?? "";
    const title =
      typeof firstMessageContent === "string"
        ? firstMessageContent.substring(0, 100)
        : "";

    const chat: Chat = {
      id: chatId,
      title,
      userId,
      createdAt,
      messages,
      teamId,
    };

    if (done && settings?.enabled) {
      await saveChat(chat);
    }
  },
});
