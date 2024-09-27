import type { MutableAIState } from "@/actions/ai/types";
import { listPlaceSuggestionsAction } from "@/actions/travel/supporting-resources/list-place-suggestions-action";
import { nanoid } from "nanoid";
import { z } from "zod";
import { PlaceSuggestionsUI } from "./ui/place-suggestions-ui";

type Args = {
  aiState: MutableAIState;
};

export function getPlaceSuggestionsTools({ aiState }: Args) {
  return {
    description: "Get place suggestions for travel",
    parameters: z.object({
      query: z.string().describe("The search query for place suggestions"),
    }),
    generate: async (args) => {
      const { query } = args;
      const toolCallId = nanoid();

      try {
        const suggestions = await listPlaceSuggestionsAction({ query });

        const props = {
          suggestions,
          query,
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
      } catch (error) {
        console.error("Failed to fetch place suggestions:", error);
        return <div>Failed to fetch place suggestions. Please try again.</div>;
      }
    },
  };
}
