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
    balance: async (params: {
      id: string;
      provider: string;
      accessToken?: string;
    }) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.set(key, value);
      }

      return this.fetch<{ data: { amount: number } }>(
        `/accounts/balance?${searchParams.toString()}`,
      );
    },
  };

  transactions = {
    list: async (params: {
      provider: string;
      accountId: string;
      accountType: string;
      accessToken?: string;
      latest?: boolean | string;
    }) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.set(key, String(value));
      }

      return this.fetch<{ data: any[] }>(
        `/transactions?${searchParams.toString()}`,
      );
    },
  };

  rates = {
    list: async () => {
      return this.fetch<{
        data: Array<{
          source: string;
          rates: Record<string, number>;
          date: string;
        }>;
      }>("/rates");
    },
  };
}

// Export configured instance
export const engine = new Engine({
  environment: process.env.NODE_ENV as "production" | "staging" | "development",
  apiKey: process.env.API_SECRET_KEY,
});
