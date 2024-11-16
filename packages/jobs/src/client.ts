import { createClient } from "@supabase/supabase-js";
import type { Database } from "@travelese/supabase/types";
import { Resend } from "resend";

export const supabase = createClient<Database>(
  `https://${process.env.NEXT_PUBLIC_SUPABASE_ID}.supabase.co`,
  process.env.SUPABASE_SERVICE_KEY!,
);

export const resend = new Resend(process.env.RESEND_API_KEY);
