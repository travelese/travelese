"use client";

import { useI18n } from "@/locales/client";
import { cn } from "@travelese/ui/cn";

export function TravelStatus({ status }) {
  const t = useI18n();

  return (
    <div className="flex items-center space-x-4">
      <div
        className={cn(
          "w-[6px] h-[6px] rounded-full bg-[#FFD02B]",
          status === "completed" && "bg-primary",
        )}
      />
      <span>{t(`travel_status.${status}`)}</span>
    </div>
  );
}
