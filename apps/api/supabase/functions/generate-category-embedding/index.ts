
import { createClient } from "jsr:@supabase/supabase-js@2.46.2";
import type { Database, Tables } from "/src/types";

type TransactionCategoriesRecord = Tables<"transaction_categories">;
interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: TransactionCategoriesRecord;
  schema: "public";
  old_record: null | TransactionCategoriesRecord;
}

const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_KEY")!,
);

const model = new Supabase.ai.Session("gte-small");

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const { id, name } = payload.record;

  if (name === payload?.old_record?.name) {
    return new Response("No change");
  }

  const embedding = await model.run(name, {
    mean_pool: true,
    normalize: true,
  });

  const { error } = await supabase
    .from("transaction_categories")
    .update({
      embedding: JSON.stringify(embedding),
    })
    .eq("id", id);

  if (error) {
    console.warn(error.message);
  }

  return new Response(JSON.stringify(embedding, null, 2));
});
