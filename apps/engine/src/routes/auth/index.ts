import type { Bindings } from "@/common/bindings";
import { ErrorSchema } from "@/common/schema";
import { PlaidApi } from "@/providers/plaid/plaid-api";
import { createErrorResponse } from "@/utils/error";
import { createRoute } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";
import { env } from "hono/adapter";
import {
  PlaidExchangeBodySchema,
  PlaidExchangeSchema,
  PlaidLinkBodySchema,
  PlaidLinkSchema,
} from "./schema";

const app = new OpenAPIHono<{ Bindings: Bindings }>();

const linkPlaidRoute = createRoute({
  method: "post",
  path: "/plaid/link",
  summary: "Auth Link (Plaid)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PlaidLinkBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PlaidLinkSchema,
        },
      },
      description: "Retrieve Link",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Returns an error",
    },
  },
});

const exchangePlaidRoute = createRoute({
  method: "post",
  path: "/plaid/exchange",
  summary: "Exchange token (Plaid)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PlaidExchangeBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PlaidExchangeSchema,
        },
      },
      description: "Retrieve Exchange",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Returns an error",
    },
  },
});

app.openapi(linkPlaidRoute, async (c) => {
  const envs = env(c);

  const { userId, language, accessToken } = await c.req.json();

  const api = new PlaidApi({
    kv: c.env.KV,
    envs,
  });

  try {
    const { data } = await api.linkTokenCreate({
      userId,
      language,
      accessToken,
    });

    return c.json(
      {
        data,
      },
      200,
    );
  } catch (error) {
    const errorResponse = createErrorResponse(error, c.get("requestId"));

    return c.json(errorResponse, 400);
  }
});

app.openapi(exchangePlaidRoute, async (c) => {
  const envs = env(c);

  const { token } = await c.req.json();

  const api = new PlaidApi({
    kv: c.env.KV,
    envs,
  });

  try {
    const data = await api.itemPublicTokenExchange({
      publicToken: token,
    });

    return c.json(data, 200);
  } catch (error) {
    const errorResponse = createErrorResponse(error, c.get("requestId"));

    return c.json(errorResponse, 400);
  }
});

export default app;
