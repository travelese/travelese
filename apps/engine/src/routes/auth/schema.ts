import { z } from "@hono/zod-openapi";

export const PlaidLinkBodySchema = z
  .object({
    userId: z.string().optional().openapi({
      example: "9293961c-df93-4d6d-a2cc-fc3e353b2d10",
    }),
    language: z.string().optional().openapi({
      example: "en",
    }),
    accessToken: z.string().optional().openapi({
      example: "ojwmef9823f892n9h98h2efoqed9823hdodfcoj13er92hef",
      description: "Used when initiating the reconnect flow",
    }),
  })
  .openapi("PlaidLinkBodySchema");

export const PlaidLinkSchema = z
  .object({
    data: z.object({
      link_token: z.string().openapi({
        example: "ojwmef9823f892n9h98h2efoqed9823hdodfcoj13er92hef",
      }),
      expiration: z.string().openapi({
        example: "2024-06-01",
      }),
    }),
  })
  .openapi("PlaidLinkSchema");

export const PlaidExchangeBodySchema = z
  .object({
    token: z.string().openapi({
      example: "ojwmef9823f892n9h98h2efoqed9823hdodfcoj13er92hef",
    }),
  })
  .openapi("PlaidExchangeBodySchema");

export const PlaidExchangeSchema = z
  .object({
    data: z.object({
      access_token: z.string().openapi({
        example: "access_9293961c",
      }),
    }),
  })
  .openapi("PlaidExchangeSchema");
