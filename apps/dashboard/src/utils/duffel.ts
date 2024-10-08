import { env } from "@/env.mjs";
import { Duffel } from "@duffel/api";

export const duffel = new Duffel({
  token: env.DUFFEL_TRAVELESE_PRO_ACCESS_TOKEN,
});
