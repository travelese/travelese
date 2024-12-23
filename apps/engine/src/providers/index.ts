import { logger } from "@/utils/logger";
import { withRetry } from "@/utils/retry";
import { PlaidProvider } from "./plaid/plaid-provider";
import type {
  DeleteAccountsRequest,
  DeleteConnectionRequest,
  GetAccountBalanceRequest,
  GetAccountsRequest,
  GetConnectionStatusRequest,
  GetHealthCheckResponse,
  GetInstitutionsRequest,
  GetTransactionsRequest,
  ProviderParams,
} from "./types";

export class Provider {
  #name?: string;

  #provider: PlaidProvider | null = null;

  constructor(params?: ProviderParams) {
    this.#name = params?.provider;

    switch (params?.provider) {
      case "plaid":
        this.#provider = new PlaidProvider(params);
        break;
      default:
    }
  }

  async getHealthCheck(
    params: Omit<ProviderParams, "provider">,
  ): Promise<GetHealthCheckResponse> {
    const plaid = new PlaidProvider(params);

    try {
      const [isPlaidHealthy] = await Promise.all([plaid.getHealthCheck()]);

      return {
        plaid: {
          healthy: isPlaidHealthy,
        },
      };
    } catch {
      throw Error("Something went wrong");
    }
  }

  async getAccounts(params: GetAccountsRequest) {
    logger("getAccounts:", `provider: ${this.#name}`);

    const data = await this.#provider?.getAccounts(params);

    if (data) {
      return data;
    }

    return [];
  }

  async getAccountBalance(params: GetAccountBalanceRequest) {
    logger(
      "getAccountBalance:",
      `provider: ${this.#name} id: ${params.accountId}`,
    );

    const data = await this.#provider?.getAccountBalance(params);

    if (data) {
      return data;
    }

    return null;
  }

  async getTransactions(params: GetTransactionsRequest) {
    logger(
      "getTransactions:",
      `provider: ${this.#name} id: ${params.accountId}`,
    );

    const data = await withRetry(() => this.#provider?.getTransactions(params));

    if (data) {
      return data;
    }

    return [];
  }

  async getInstitutions(params: GetInstitutionsRequest) {
    logger("getInstitutions:", `provider: ${this.#name}`);

    const data = await withRetry(() => this.#provider?.getInstitutions(params));

    if (data) {
      return data;
    }

    return [];
  }

  async deleteAccounts(params: DeleteAccountsRequest) {
    logger("delete:", `provider: ${this.#name}`);

    return this.#provider?.deleteAccounts(params);
  }

  async getConnectionStatus(params: GetConnectionStatusRequest) {
    logger("getConnectionStatus:", `provider: ${this.#name}`);

    const data = await this.#provider?.getConnectionStatus(params);

    if (data) {
      return data;
    }

    return { status: "connected" };
  }

  async deleteConnection(params: DeleteConnectionRequest) {
    logger("deleteConnection:", `provider: ${this.#name}`);

    return this.#provider?.deleteConnection(params);
  }
}
