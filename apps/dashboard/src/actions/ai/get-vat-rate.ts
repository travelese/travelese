"use server";

import { xai } from "@/utils/xai";
import { getCountry } from "@travelese/location";
import { generateObject } from "ai";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { getVatRateSchema } from "../schema";

export const getVatRateAction = authActionClient
  .schema(getVatRateSchema)
  .metadata({
    name: "get-vat-rate",
  })
  .action(async ({ parsedInput: { name } }) => {
    const country = getCountry();

    const { object } = await generateObject({
      model: xai("grok-beta"),
      schema: z.object({
        vat: z.number().min(5).max(100),
      }),
      prompt: `
        You are an expert in VAT rates for the specific country and category \n
        What's the VAT rate for category ${name} in ${country.name}?
      `,
      temperature: 0.8,
    });

    return {
      vat: object.vat,
      country: country.name,
    };
  });
