"use client";

import type { searchTravelSchema } from "@/actions/schema";
import type { Places } from "@duffel/api/Places/Suggestions/SuggestionsType";
import { Alert, AlertDescription, AlertTitle } from "@travelese/ui/alert";
import { Card } from "@travelese/ui/card";
import { cn } from "@travelese/ui/cn";
import { Icons } from "@travelese/ui/icons";
import { SubmitButton } from "@travelese/ui/submit-button";
import type { z } from "zod";

interface TravelCardProps {
  type: "flight" | "stay";
  travel: z.infer<typeof searchTravelSchema>;
  placeSuggestions: Array<Array<Places>>;
  searchResultsData: Record<string, string>;
  price: string;
  currency: string;
  emission?: string;
  rating?: number;
  reviewScore?: number;
  children: React.ReactNode;
  className?: string;
}

export function TravelCard({
  type,
  price,
  currency,
  emission,
  rating,
  reviewScore,
  children,
  className,
}: TravelCardProps) {
  return (
    <Card>
      <div
        className={cn(
          "flex flex-col sm:flex-row w-full items-start sm:items-center justify-between p-4 sm:p-6 rounded-lg",
          "font-mono", // Chat UI specific styling
          className,
        )}
      >
        {children}
        <div className="flex flex-col items-center justify-center w-full sm:w-1/3 mt-4 sm:mt-0 space-y-3">
          <Alert className="w-full sm:w-auto text-center">
            <div className="flex flex-col items-center">
              {emission ? (
                <>
                  <Icons.Cloud className="size-4 mb-1" />
                  <AlertTitle>Emission</AlertTitle>
                  <AlertDescription>
                    {emission} kg CO<sub>2</sub>
                  </AlertDescription>
                </>
              ) : rating ? (
                <>
                  <AlertTitle>
                    <div className="flex items-center mb-1">
                      {[...Array(rating)].map((_, i) => (
                        <Icons.Star
                          key={i}
                          className="size-4 text-muted-foreground"
                        />
                      ))}
                    </div>
                  </AlertTitle>
                  <AlertDescription>
                    {reviewScore?.toFixed(1) || "N/A"}/10
                  </AlertDescription>
                </>
              ) : null}
            </div>
          </Alert>
          <div className="text-2xl font-bold text-center">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currency,
            }).format(Number(price))}
          </div>
          <SubmitButton isSubmitting={false}>Select {type}</SubmitButton>
        </div>
      </div>
    </Card>
  );
}
