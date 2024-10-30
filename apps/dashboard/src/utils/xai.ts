import { createOpenAI } from "@ai-sdk/openai";

export const xai = createOpenAI({
  name: "xai",
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY ?? "",
});
