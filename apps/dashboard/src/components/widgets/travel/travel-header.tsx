"use client";

import { TravelMonthSelect } from "@/components/travel-month-select";
import { secondsToHoursAndMinutes } from "@/utils/format";
import Link from "next/link";

type Props = {
  totalDuration?: number;
};

export function TravelHeader({ totalDuration }: Props) {
  return (
    <div className="flex justify-between">
      <div>
        <Link href="/travel" prefetch>
          <h2 className="text-lg">Travel</h2>
        </Link>
        <span className="text-[#878787] text-sm">
          {totalDuration ? secondsToHoursAndMinutes(totalDuration) : "0h"}
        </span>
      </div>

      <TravelMonthSelect />
    </div>
  );
}
