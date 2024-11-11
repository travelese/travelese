import { PlaidApi } from "@/providers/plaid/plaid-api";
import { getFileExtension, getLogoURL } from "@/utils/logo";
import { getPopularity, matchLogoURL } from "./utils";

export async function getPlaidInstitutions() {
  const provider = new PlaidApi({
    // @ts-ignore
    envs: {
      PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID!,
      PLAID_SECRET: process.env.PLAID_SECRET!,
    },
  });

  const data = await provider.getInstitutions();

  return data.map((institution) => {
    return {
      id: institution.institution_id,
      name: institution.name,
      logo: institution.logo
        ? getLogoURL(institution.institution_id)
        : matchLogoURL(institution.institution_id),
      countries: institution.country_codes,
      popularity: getPopularity(institution.institution_id),
      provider: "plaid",
    };
  });
}

export async function getInstitutions() {
  const data = await Promise.all([getPlaidInstitutions()]);

  return data.flat();
}
