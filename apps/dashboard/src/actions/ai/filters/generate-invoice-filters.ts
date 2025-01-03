"use server";

import { filterInvoiceSchema } from "@/actions/schema";
import { xai } from "@/utils/xai";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";

const VALID_FILTERS = [
  "name",
  "due_date",
  "start",
  "end",
  "customers",
  "statuses",
];

export async function generateInvoiceFilters(prompt: string, context?: string) {
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: xai("grok-beta"),
      system: `You are a helpful assistant that generates filters for a given prompt. \n
               Current date is: ${new Date().toISOString().split("T")[0]} \n
               ${context}
      `,
      schema: filterInvoiceSchema.pick({
        ...(VALID_FILTERS.reduce((acc, filter) => {
          acc[filter] = true;
          return acc;
        }, {}) as any),
      }),
      prompt,
      temperature: 0.7,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}
