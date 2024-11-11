import { logger } from "./logger";

export class ProviderError extends Error {
  code: string;

  constructor({ message, code }: { message: string; code: string }) {
    super(message);
    this.code = this.setCode(code);
  }

  setCode(code: string) {
    switch (code) {
      // Plaid
      case "ITEM_LOGIN_REQUIRED":
      case "ITEM_LOCKED":
      case "ITEM_CONCURRENTLY_DELETED":
      case "ACCESS_NOT_GRANTED":
        return "disconnected";
      default:
        logger("unknown", this.message);

        return "unknown";
    }
  }
}

export function createErrorResponse(error: unknown, requestId: string) {
  console.error(error);

  if (error instanceof ProviderError) {
    return {
      requestId,
      message: error.message,
      code: error.code,
    };
  }

  return {
    requestId,
    message: String(error),
    code: "unknown",
  };
}
