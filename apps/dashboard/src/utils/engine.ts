import { env } from "@/env.mjs";

interface EngineConfig {
  environment?: "production" | "staging" | "development";
  baseUrl?: string;
  apiKey?: string;
}

export class Engine {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: EngineConfig = {}) {
    this.baseUrl = config.baseUrl || "http://localhost:3002";
    this.apiKey = config.apiKey || "";

    if (config.environment === "production") {
      this.baseUrl = "https://api.travelese.ai";
    } else if (config.environment === "staging") {
      this.baseUrl = "https://api.staging.travelese.ai";
    }
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  accounts = {
    list: async (params: {
      id?: string;
      provider: string;
      accessToken?: string;
      institutionId?: string;
    }) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.set(key, value);
      }

      return this.fetch<{ data: any[] }>(
        `/accounts?${searchParams.toString()}`,
      );
    },
  };

  auth = {
    plaid: {
      exchange: async ({ token }: { token: string }) => {
        return this.fetch<{ data: { access_token: string } }>(
          "/auth/plaid/exchange",
          {
            method: "POST",
            body: JSON.stringify({ token }),
          },
        );
      },
      link: async ({
        userId,
        accessToken,
      }: { userId: string; accessToken?: string }) => {
        return this.fetch<{ data: { link_token: string } }>(
          "/auth/plaid/link",
          {
            method: "POST",
            body: JSON.stringify({ userId, accessToken }),
          },
        );
      },
    },
  };

  institutions = {
    list: async ({
      countryCode,
      query,
    }: { countryCode: string; query?: string }) => {
      const searchParams = new URLSearchParams({
        countryCode,
        ...(query && { q: query }),
      });

      return this.fetch<{ data: any[] }>(
        `/institutions?${searchParams.toString()}`,
      );
    },
  };
}

// Export configured instance
export const engine = new Engine({
  environment: process.env.NODE_ENV as "production" | "staging" | "development",
  apiKey: env.ENGINE_API_KEY,
});
