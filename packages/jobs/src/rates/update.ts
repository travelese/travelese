import { logger, task } from "@trigger.dev/sdk/v3";
import { supabase } from "../client";
import { Jobs } from "../constants";
import { engine } from "../utils/engine";
import { processBatch } from "../utils/process";

export const updateExchangeRates = task({
  id: Jobs.EXCHANGE_RATES_UPDATE,
  run: async (_, io) => {
    const rates = await engine.rates.list();

    const data = rates.data.flatMap((rate) => {
      return Object.entries(rate.rates).map(([target, value]) => ({
        base: rate.source,
        target: target,
        rate: value,
        updated_at: rate.date,
      }));
    });

    await logger.info("Updating exchange rates", { data });

    await processBatch(data, 500, async (batch) => {
      await supabase.from("exchange_rates").upsert(batch, {
        onConflict: "base, target",
        ignoreDuplicates: false,
      });
    });
  },
});
