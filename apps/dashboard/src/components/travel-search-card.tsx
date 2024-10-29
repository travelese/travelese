"use client";

import { createOfferRequestAction } from "@/actions/create-offer-request-action";
import { createPartialOfferRequestAction } from "@/actions/create-partial-offer-request-action";
import { listOffersAction } from "@/actions/list-offers-action";
import { TravelSearchForm } from "@/components/forms/travel-search-form";
import { Card, CardContent, CardHeader } from "@travelese/ui/card";
import { useToast } from "@travelese/ui/use-toast";
import { useAction } from "next-safe-action/hooks";
import { parseAsJson, parseAsString, useQueryStates } from "nuqs";

interface Props {
  userId: string;
  currency: string;
}

export function TravelSearchCard({ userId, currency }: Props) {
  const { toast } = useToast();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      travel_type: parseAsString.withDefault("return"),
      cabin_class: parseAsString.withDefault("economy"),
      passengers: parseAsJson<Array<{ type: string }>>().withDefault([
        { type: "adult" },
      ]),
      slices: parseAsJson<
        Array<{ origin: string; destination: string; departure_date: string }>
      >().withDefault([
        { origin: "", destination: "", departure_date: "" },
        { origin: "", destination: "", departure_date: "" },
      ]),
      bags: parseAsJson<{
        carry_on: number;
        cabin: number;
        checked: number;
      }>().withDefault({ carry_on: 0, cabin: 0, checked: 0 }),
      listOffersId: parseAsString.withDefault(""),
    },
    { history: "push" },
  );

  const listOffers = useAction(listOffersAction, {
    onSuccess: ({ data: { offers, listOffersId } }) => {
      setQueryParams((prev) => ({ ...prev, listOffersId }));

      toast({
        title: "Flights Found",
        description: `Found ${offers.length} flight options`,
        variant: "success",
      });
    },
  });

  const createOfferRequest = useAction(createOfferRequestAction, {
    onSuccess: ({ data: offerRequest }) => {
      toast({
        title: "Offer Request Created",
        description: `Offer Request ID: ${offerRequest?.id}`,
        variant: "success",
      });

      listOffers.execute({ offer_request_id: offerRequest.id });
    },
  });

  const createPartialOfferRequest = useAction(createPartialOfferRequestAction, {
    onSuccess: ({ data: offerRequest }) => {
      toast({
        title: "Offer Request Created",
        description: `Offer Request ID: ${offerRequest?.id}`,
        variant: "success",
      });

      listOffers.execute({ offer_request_id: offerRequest.id });
    },
  });

  const handleSubmit = (data: any) => {
    if (data.travel_type === "multi_city") {
      createPartialOfferRequest.execute(data);
    } else {
      createOfferRequest.execute(data);
    }
  };

  return (
    <Card>
      <CardHeader />
      <CardContent>
        <TravelSearchForm
          defaultValues={{
            slices: queryParams.slices,
            passengers: queryParams.passengers,
            cabin_class: queryParams.cabin_class,
            travel_type: queryParams.travel_type,
            bags: queryParams.bags,
          }}
          onSubmit={handleSubmit}
          isSubmitting={
            createOfferRequest.isExecuting ||
            createPartialOfferRequest.isExecuting
          }
          onQueryParamsChange={(updates) =>
            setQueryParams((prev) => ({ ...prev, ...updates }))
          }
        />
      </CardContent>
    </Card>
  );
}
