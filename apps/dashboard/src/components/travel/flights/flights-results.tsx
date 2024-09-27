"use client";

import type { Offer } from "@duffel/api/types";
import { useEffect, useState } from "react";
import FlightsCard from "./flights-card";

interface FlightsResultsProps {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: string;
  cabinClass: string;
}

export function FlightsResults({
  origin,
  destination,
  departureDate,
  returnDate,
  passengers,
  cabinClass,
}: FlightsResultsProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Here you would typically fetch the flight offers based on the search criteria
    // For now, we'll just simulate a loading state and then set some dummy data
    setIsLoading(true);
    setTimeout(() => {
      setOffers([
        // Add some dummy offer data here
      ]);
      setIsLoading(false);
    }, 1500);
  }, [origin, destination, departureDate, returnDate, passengers, cabinClass]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <FlightsCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
