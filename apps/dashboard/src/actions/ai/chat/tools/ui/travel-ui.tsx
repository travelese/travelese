import { BotCard } from "@/components/chat/messages";
import type { Offer } from "@duffel/api/types";
import type { Stay } from "@duffel/api/types";
import { format } from "date-fns";

interface FlightOptionProps {
  offer: Offer;
}

function FlightOption({ offer }: FlightOptionProps) {
  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">
          {offer.total_amount} {offer.total_currency}
        </span>
        <span className="text-sm text-muted-foreground">
          {offer.owner.name}
        </span>
      </div>

      <div className="space-y-4">
        {offer.slices.map((slice, index) => (
          <div key={slice.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Flight {index + 1}</span>
              <span>{slice.duration.replace("PT", "")} duration</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-medium">{slice.origin.iata_code}</div>
                <div className="text-sm text-muted-foreground">
                  {format(
                    new Date(slice.segments[0].departing_at),
                    "HH:mm, MMM d",
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium">{slice.destination.iata_code}</div>
                <div className="text-sm text-muted-foreground">
                  {format(
                    new Date(
                      slice.segments[slice.segments.length - 1].arriving_at,
                    ),
                    "HH:mm, MMM d",
                  )}
                </div>
              </div>
            </div>

            {slice.segments.length > 1 && (
              <div className="text-sm text-muted-foreground">
                {slice.segments.length - 1} stop(s)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface StayOptionProps {
  stay: Stay;
}

function StayOption({ stay }: StayOptionProps) {
  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">
          {stay.price.amount} {stay.price.currency}
        </span>
        <span className="text-sm text-muted-foreground">
          {stay.property.name}
        </span>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          {stay.property.address.line1}, {stay.property.address.city}
        </div>
        <div className="text-sm">
          {format(new Date(stay.check_in), "MMM d")} -{" "}
          {format(new Date(stay.check_out), "MMM d")}
        </div>
      </div>
    </div>
  );
}

interface Props {
  type: "flight" | "stay";
  data: Offer[] | Stay[];
}

export function TravelUI({ type, data }: Props) {
  if (!data?.length) {
    return (
      <BotCard>
        <div className="text-sm text-muted-foreground">
          No {type} options found
        </div>
      </BotCard>
    );
  }

  return (
    <BotCard>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Available {type === "flight" ? "Flight" : "Stay"} Options
        </h3>

        {type === "flight" &&
          (data as Offer[]).map((offer) => (
            <FlightOption key={offer.id} offer={offer} />
          ))}

        {type === "stay" &&
          (data as Stay[]).map((stay) => (
            <StayOption key={stay.id} stay={stay} />
          ))}
      </div>
    </BotCard>
  );
}
