import type { MutableAIState } from "@/actions/ai/types";
import { listPlaceSuggestionsAction } from "@/actions/travel/supporting-resources/list-place-suggestions-action";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { nanoid } from "nanoid";
import { z } from "zod";
import { PlaceSuggestionsUI } from "./ui/place-suggestions-ui";

type Args = {
  aiState: MutableAIState;
  query: string;
};

export function listPlaceSuggestionsTools({ aiState, query }: Args) {
  return {
    description: "Get place suggestions for travel",
    parameters: z.object({
      query: z.string(),
    }),
    generate: async (args) => {
      const { query } = args;

      const data = await listPlaceSuggestionsAction({ query });

      console.log("data", data);

      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          "You are a travel agent. Your task is to provide a simple, clear, and concise content. Return only the result with a short description only with text.",
        prompt: `Here are some place suggestions in ${query}: ${JSON.stringify(data)}.`,
      });

      const toolCallId = nanoid();

      const props = {
        suggestions: data,
        query,
        description: text,
      };

      aiState.done({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: nanoid(),
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolName: "getPlaceSuggestions",
                toolCallId,
                args,
              },
            ],
          },
          {
            id: nanoid(),
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolName: "getPlaceSuggestions",
                toolCallId,
                result: props,
              },
            ],
          },
        ],
      });

      return <PlaceSuggestionsUI {...props} />;
    },
  };
}
