import { getBankAccountsCurrencies } from "@travelese/supabase/cached-queries";
import { Suspense } from "react";
import { TravelFilters } from "./travel-filters";

export async function TravelFiltersServer() {
  const currencies = await getBankAccountsCurrencies();

  return (
    <Suspense>
      <TravelFilters
        currencies={
          currencies?.data?.map((currency) => {
            return {
              id: currency.currency,
              name: currency.currency,
            };
          }) ?? []
        }
      />
    </Suspense>
  );
}
