"use client";

import { createPartialOfferRequestAction } from "@/actions/create-partial-offer-request-action";
import { listOffersAction } from "@/actions/list-offers-action";
import { TravelSearchForm } from "@/components/forms/travel-search-form";
import { useTravelSearchParams } from "@/hooks/use-travel-params";
import { Card, CardContent, CardHeader } from "@travelese/ui/card";
import { useToast } from "@travelese/ui/use-toast";
import { useAction } from "next-safe-action/hooks";

interface Props {
  userId: string;
  currency: string;
}

export function TravelSearchCard({ userId, currency }: Props) {
  const { toast } = useToast();
  const {
    travel_type,
    cabin_class,
    passengers,
    slices,
    bags,
    offer_request_id,
    setParams,
  } = useTravelSearchParams();

  const listOffers = useAction(listOffersAction, {
    onSuccess: ({ data: { offers, listOffersId } }) => {
      setParams((prev) => ({ ...prev, offer_request_id: listOffersId }));

      toast({
        title: "Flights Found",
        description: `Found ${offers.length} flight options`,
        variant: "success",
      });
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
    createPartialOfferRequest.execute(data);
  };

  return (
    <Card>
      <CardHeader />
      <CardContent>
        <TravelSearchForm
          defaultValues={{
            slices,
            passengers,
            cabin_class,
            travel_type,
            bags,
          }}
          onSubmit={handleSubmit}
          isSubmitting={createPartialOfferRequest.isExecuting}
          onQueryParamsChange={(updates) =>
            setParams((prev) => ({ ...prev, ...updates }))
          }
        />
      </CardContent>
    </Card>
  );
}
