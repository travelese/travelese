import FlightsCard from "@/components/cards/flights-card";
import { client as RedisClient } from "@travelese/kv";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@travelese/ui/carousel";
import { parseAsString, useQueryState } from "nuqs";

export async function TravelResults() {
  const [listOffersId] = useQueryState("listOffersId", parseAsString);

  const offers = await RedisClient.smembers(`list-offers:${listOffersId}`);
  const parsedOffers = offers.map((offer) => JSON.parse(offer));

  const items = parsedOffers.map((offer) => (
    <FlightsCard key={offer.id} offer={offer} />
  ));

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
