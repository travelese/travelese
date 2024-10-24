"use client";

import { createOfferRequestAction } from "@/actions/travel/create-offer-request-action";
import { createPartialOfferRequestAction } from "@/actions/travel/create-partial-offer-request-action";
import { createOfferRequestSchema } from "@/actions/travel/schema";
import { TravelCabin } from "@/components/travel/travel-cabin";
import { TravelLocation } from "@/components/travel/travel-location";
import { TravelBaggage } from "@/components/travel/travel-baggage";
import { TravelPeriod } from "@/components/travel/travel-period";
import { TravelTraveller } from "@/components/travel/travel-traveller";
import { TravelType } from "@/components/travel/travel-type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@travelese/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@travelese/ui/form";
import { Icons } from "@travelese/ui/icons";
import { SubmitButton } from "@travelese/ui/submit-button";
import { useToast } from "@travelese/ui/use-toast";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { parseAsJson, parseAsString, useQueryStates } from "nuqs";
import { z } from "zod";

export function SearchFlightsForm() {
  const { toast } = useToast();

  const [urlStates] = useQueryStates({
    travelType: parseAsString,
    cabinClass: parseAsString,
    passengers: parseAsJson<Array<{ type: string }>>(),
    baggage: parseAsString,
    slices: parseAsJson(),
  });

  const form = useForm({
    resolver: zodResolver(createOfferRequestSchema),
    defaultValues: {
      travelType: urlStates?.travelType ?? "return",
      cabinClass: urlStates?.cabinClass ?? "economy",
      passengers: urlStates?.passengers ?? [{ type: "adult" }],
      baggage: urlStates?.baggage ?? "",
      slices: urlStates?.slices ?? [
        {
          origin: "",
          destination: "",
          fromDate: "",
        },
      ],
    },
  });

  const createOfferRequest = useAction(createOfferRequestAction, {
    onSuccess: () => {
      toast({
        duration: 3500,
        title: "Search completed",
        description: "The search has been completed.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        duration: 3500,
        title: "Something went wrong please try again.",
        variant: "error",
      });
    },
  });

  const createPartialOfferRequest = useAction(createPartialOfferRequestAction, {
    onSuccess: () => {
      toast({
        duration: 3500,
        title: "Search completed",
        description: "The search has been completed.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        duration: 3500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  const handleFormSubmit = async (
    data: z.infer<typeof createOfferRequestSchema>,
  ) => {
    if (data.travelType === "multi_city") {
      return createPartialOfferRequest.execute(data);
    }
    return createOfferRequest.execute(data);
  };

  const addFlightSegment = () => {
    const currentSlices = form.getValues("slices");
    if (currentSlices.length < 3) {
      form.setValue("slices", [
        ...currentSlices,
        {
          origin: "",
          destination: "",
          fromDate: "",
        },
      ]);
    }
  };

  const removeFlightSegment = (indexToRemove: number) => {
    const currentSlices = form.getValues("slices");
    if (currentSlices.length > 1) {
      form.setValue(
        "slices",
        currentSlices.filter((_, index) => index !== indexToRemove),
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 mx-auto max-w-4xl">
          <FormField
            control={form.control}
            name="travelType"
            render={() => (
              <FormItem>
                <FormControl>
                  <TravelType disabled={createOfferRequest.isExecuting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cabinClass"
            render={() => (
              <FormItem>
                <FormControl>
                  <TravelCabin disabled={createOfferRequest.isExecuting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passengers"
            render={() => (
              <FormItem>
                <FormControl>
                  <TravelTraveller disabled={createOfferRequest.isExecuting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baggage"
            render={() => (
              <FormItem>
                <FormControl>
                  <TravelBaggage disabled={createOfferRequest.isExecuting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 mx-auto max-w-4xl">
          {form.watch("slices")?.map((_, index) => (
            <div
              key={index}
              className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-2"
            >
              {(urlStates.travelType === "multi_city" || index === 0) && (
                <>
                  <FormField
                    control={form.control}
                    name={`slices.${index}.origin`}
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <TravelLocation
                            type="origin"
                            placeholder="Origin"
                            index={index}
                            disabled={createOfferRequest.isExecuting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`slices.${index}.destination`}
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <TravelLocation
                            type="destination"
                            placeholder="Destination"
                            index={index}
                            disabled={createOfferRequest.isExecuting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`slices.${index}.fromDate`}
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <TravelPeriod
                            index={index}
                            disabled={createOfferRequest.isExecuting}
                            travelType={urlStates.travelType}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {urlStates.travelType === "multi_city" &&
                    index === form.watch("slices").length - 1 && (
                    <div className="flex space-x-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => removeFlightSegment(index)}
                        disabled={form.watch("slices").length <= 1}
                        className="w-10 h-10 flex-1"
                      >
                        <Icons.Close className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={addFlightSegment}
                        disabled={form.watch("slices").length >= 3}
                        className="w-10 h-10 flex-1"
                      >
                        <Icons.Plus className="h-4 w-4" />
                      </Button>
                      <SubmitButton
                        type="submit"
                        size="icon"
                        className="w-10 h-10 flex-1"
                        isSubmitting={createOfferRequest.isExecuting ||
                          createPartialOfferRequest.isExecuting}
                      >
                        <Icons.Travel className="h-4 w-4" />
                      </SubmitButton>
                    </div>
                  )}

                  {((urlStates.travelType === "one_way" && index === 0) ||
                    (urlStates.travelType === "return" && index === 0)) && (
                    <SubmitButton
                      isSubmitting={createOfferRequest.isExecuting ||
                        createPartialOfferRequest.isExecuting}
                      className="w-full"
                    >
                      Search
                    </SubmitButton>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </form>
    </Form>
  );
}
