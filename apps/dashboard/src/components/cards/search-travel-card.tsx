"use client";

import { SearchFlightsForm } from "@/components/forms/search-flights-form";
import { Card, CardContent, CardHeader, CardTitle } from "@travelese/ui/card";

export function TravelSearchCard({
  userId,
  currency,
}: {
  userId: string;
  currency: string;
}) {
  return (
    <Card>
      <CardHeader />
      <CardContent>
        <SearchFlightsForm
          userId={userId}
          currency={currency}
          onCreate={() => { }}
        />
      </CardContent>
    </Card>
  );
}
