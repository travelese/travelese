import { BotCard } from "@/components/chat/messages";
import type { Offer } from "@duffel/api/types";

type Props = {
  offerRequest: {
    offers: Offer[];
  };
};

export function OfferRequestUI({ offerRequest }: Props) {
  return (
    <BotCard>
      <h3 className="text-lg font-semibold mb-2">Flight Options</h3>
      {offerRequest.offers && offerRequest.offers.length > 0 ? (
        offerRequest.offers.map((offer, index) => (
          <div
            key={offer.id}
            className="mb-4 p-2 border border-gray-200 rounded"
          >
            <h4 className="font-semibold">Option {index + 1}</h4>
            <p>
              Total Price: {offer.total_amount} {offer.total_currency}
            </p>
            {offer.slices.map((slice, sliceIndex) => (
              <div key={slice.id} className="mt-2">
                <p>
                  Flight {sliceIndex + 1}: {slice.origin.iata_code} to{" "}
                  {slice.destination.iata_code}
                </p>
                <p>
                  Departure:{" "}
                  {new Date(slice.segments[0].departing_at).toLocaleString()}
                </p>
                <p>
                  Arrival:{" "}
                  {new Date(
                    slice.segments[slice.segments.length - 1].arriving_at,
                  ).toLocaleString()}
                </p>
                <p>Duration: {slice.duration}</p>
                <p>Airline: {slice.segments[0].operating_carrier.name}</p>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>No flight options available for this request.</p>
      )}
    </BotCard>
  );
}
