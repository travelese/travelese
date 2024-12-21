export interface Bindings {
  KV: KVNamespace;
  ENRICH_KV: KVNamespace;
  STORAGE: R2Bucket;
  TELLER_CERT: Fetcher;
  AI: Ai;
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  PLAID_ENVIRONMENT: string;
  TYPESENSE_API_KEY: string;
  TYPESENSE_ENDPOINT: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  UPSTASH_REDIS_REST_URL: string;
}
