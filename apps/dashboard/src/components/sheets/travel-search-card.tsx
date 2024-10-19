"use client";

import { SearchFlightsForm } from "@/components/forms/search-flights-form";
import { Card, CardContent, CardHeader, CardTitle } from "@travelese/ui/card";
import { useMediaQuery } from "@travelese/ui/hooks";
import { ScrollArea } from "@travelese/ui/scroll-area";
import { useQueryState } from "nuqs";

export function TravelSearchCard({
  userId,
  currency,
}: {
  userId: string;
  accountId: string;
  currency: string;
}) {
  return (
    <Card>
      <CardContent>
        <SearchFlightsForm
          userId={userId}
          currency={currency}
          onCreate={() => {}}
        />
      </CardContent>
    </Card>
  );
}
