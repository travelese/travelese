import { getLocale, getTimezone } from "@travelese/location";
import { getUser } from "@travelese/supabase/cached-queries";
import { createClient } from "@travelese/supabase/server";

export async function setupUser(userId: string) {
  const supabase = createClient();

  const locale = getLocale();
  const timezone = getTimezone();

  try {
    const user = await getUser();

    // Set timezone if not set
    if (!user?.data?.timezone) {
      await supabase
        .from("users")
        .update({ timezone, locale })
        .eq("id", userId);
    }
  } catch (error) {
    console.error(error);
  }
}
