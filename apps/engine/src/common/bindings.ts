export interface Bindings {
  KV: KVNamespace;
  STORAGE: R2Bucket;
  API_SECRET_KEY: string;

  // Plaid
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  PLAID_ENVIRONMENT: string;

  // Typesense
  TYPESENSE_API_KEY: string;
  TYPESENSE_ENDPOINT: string;

  // Optional Redis caching
  UPSTASH_REDIS_REST_TOKEN?: string;
  UPSTASH_REDIS_REST_URL?: string;
}
