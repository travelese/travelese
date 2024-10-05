import { ChangeLanguage } from "@/components/change-language";
import { ChangeTimezone } from "@/components/change-timezone";
import { WeekSettings } from "@/components/week-settings";
import { getTimezone, getTimezones } from "@travelese/location";
import { getUser } from "@travelese/supabase/cached-queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Language & region | Travelese",
};

export default async function Language() {
  const { data: userData } = await getUser();
  const timezone = userData?.timezone || getTimezone();
  const timezones = getTimezones();

  return (
    <div className="space-y-12">
      <ChangeLanguage />
      <ChangeTimezone value={timezone} timezones={timezones} />

      <WeekSettings weekStartsOnMonday={userData?.week_starts_on_monday} />
    </div>
  );
}