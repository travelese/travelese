import CreateOfferForm from "@/components/forms/create-offer-form";
import { FlightsWidget } from "@/components/widgets/travel/flights-widget";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@travelese/ui/carousel";
import React from "react";

export const metadata = {
  title: "Travel | Travelese",
};

export default function Travel() {
  const items = [<FlightsWidget key="flights-widget" />];

  return (
    <div className="container mx-auto px-4">
      <div className="h-[530px] mb-[-4rem]">
        <CreateOfferForm />
      </div>
      <Carousel
        className="flex flex-col -mt-8"
        opts={{
          align: "start",
        }}
      >
        <div className="ml-auto hidden md:flex mb-4">
          <CarouselPrevious className="static p-0 border-none hover:bg-transparent" />
          <CarouselNext className="static p-0 border-none hover:bg-transparent" />
        </div>

        <CarouselContent className="-ml-[20px] 2xl:-ml-[40px] flex-col md:flex-row space-y-6 md:space-y-0">
          {items.map((item, idx) => {
            return (
              <CarouselItem
                className="lg:basis-1/2 xl:basis-1/3 3xl:basis-1/4 pl-[20px] 2xl:pl-[40px]"
                key={idx.toString()}
              >
                {item}
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
