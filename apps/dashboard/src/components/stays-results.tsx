"use client";

import type { StaysSearchResult } from "@duffel/api/types";
import { useEffect, useState } from "react";
import StaysCard from "./stays-card";

interface StaysResultsProps {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
}

export function StaysResults({
  location,
  checkInDate,
  checkOutDate,
  guests,
  rooms,
}: StaysResultsProps) {
  const [stays, setStays] = useState<StaysSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Here you would typically fetch the stays based on the search criteria
    // For now, we'll just simulate a loading state and then set some dummy data
    setIsLoading(true);
    setTimeout(() => {
      setStays([
        // Add some dummy stay data here
      ]);
      setIsLoading(false);
    }, 1500);
  }, [location, checkInDate, checkOutDate, guests, rooms]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {stays.map((stay) => (
        <StaysCard key={stay.id} stay={stay} onSelect={() => {}} />
      ))}
    </div>
  );
}
