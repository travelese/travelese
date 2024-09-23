"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import BookForm from "@/components/travel/book-form";
import FlightsCard from "@/components/travel/flights/flights-card";
import PriceCard from "@/components/travel/price-card";
import type { Offer } from "@duffel/api/types";
import { Skeleton } from "@travelese/ui/skeleton";
import { toast } from "sonner";

export default function FlyBookPage() {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const offerId = searchParams.get("id");
    if (offerId) {
      setLoading(true);
      fetch(`/api/travel/fly/book?id=${offerId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data: Offer) => {
          setSelectedOffer(data);
        })
        .catch((error) => {
          setError(error.message);
        })
        .finally(() => setLoading(false));
    } else {
      setError("No Offer ID provided");
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <main className="grid flex-1 items-start gap-8 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 p-6 md:p-10 border">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </main>
    );
  }

  if (error) {
    return toast.error(error as string, {
      description: "Failed to fetch offer",
    });
  }

  return (
    <main className="grid flex-1 items-start gap-8 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 p-6 md:p-10 border">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-6">
          {selectedOffer && <FlightsCard offer={selectedOffer} />}
          {selectedOffer && <BookForm selectedOffer={selectedOffer} />}
        </div>
      </div>
      {selectedOffer && <PriceCard selectedOffer={selectedOffer} />}
    </main>
  );
}
