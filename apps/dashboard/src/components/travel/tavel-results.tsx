import { Travel } from "@/components/widgets/travel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@travelese/ui/carousel";
import { formatISO } from "date-fns";
import React from "react";

export function TravelResults() {
  const items = [
    <Travel
      key="travel-widget"
      date={formatISO(new Date(), { representation: "date" })}
    />,
  ];

  return (
    <Carousel
      className="flex flex-col"
      opts={{
        align: "start",
      }}
    >
      <div className="ml-auto hidden md:flex">
        <CarouselPrevious className="static p-0 border-none hover:bg-transparent" />
        <CarouselNext className="static p-0 border-none hover:bg-transparent" />
      </div>

      <CarouselContent className="-ml-[20px] 2xl:-ml-[40px] flex-col md:flex-row space-y-6 md:space-y-0">
        {items.map((item, idx) => (
          <CarouselItem
            className="lg:basis-1/2 xl:basis-1/3 3xl:basis-1/4 pl-[20px] 2xl:pl-[40px]"
            key={idx.toString()}
          >
            {item}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
