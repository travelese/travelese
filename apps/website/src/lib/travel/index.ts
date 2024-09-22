import { env } from "@/lib/env.mjs";
import { Duffel } from "@duffel/api";

export const duffel = new Duffel({
  token: env.DUFFEL_TRAVELESE_ACCESS_TOKEN,
});
