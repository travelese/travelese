import { PlaidProvider } from "@/providers/plaid/plaid-provider";
import type { ProviderParams } from "@/providers/types";

export const excludedInstitutions = [
  "ins_56", // Chase - Plaid
];

export async function getInstitutions(
  params: Omit<
    ProviderParams & { countryCode: string; storage: R2Bucket },
    "provider"
  >,
) {
  const { countryCode } = params;

  const plaid = new PlaidProvider(params);

  const result = await Promise.all([plaid.getInstitutions({ countryCode })]);

  return result.flat();
}
