import { env } from "@/env.mjs";
import { createOpenAI as createGroq } from "@ai-sdk/openai";

export const groq = createGroq({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: env.GROQ_API_KEY,
});
