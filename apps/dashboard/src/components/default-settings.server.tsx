import { getTimezone } from "@travelese/location";
import { getLocale } from "@travelese/location";
import { getDateFormat } from "@travelese/location";
import { getUser } from "@travelese/supabase/cached-queries";
import { createClient } from "@travelese/supabase/server";

export async function DefaultSettings() {
  const supabase = createClient();

  const locale = getLocale();
  const timezone = getTimezone();
  const dateFormat = getDateFormat();

  try {
    const user = await getUser();

    const { id, date_format } = user?.data ?? {};

    // Set default date format if not set
    if (!date_format && id) {
      await supabase
        .from("users")
        .update({
          date_format: dateFormat,
          timezone,
          locale,
        })
        .eq("id", id);
    }
  } catch (error) {
    console.error(error);
  }

  return null;
}
