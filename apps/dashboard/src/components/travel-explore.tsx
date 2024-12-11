"use client";

import { exploreTravelAction } from "@/actions/explore-travel-action";
import { Map } from "@/components/map";
import { Planes } from "@/components/planes";
import { parseAsJson, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";

export default function TravelExplore() {
  const [flights, setFlights] = useState([]);
  const [queryParams] = useQueryStates({
    geocode: parseAsJson<{
      latitude: number;
      longitude: number;
    }>().withDefault({
      latitude: 0,
      longitude: 0,
    }),
  });

  useEffect(() => {
    async function fetchFlights() {
      try {
        const data = await exploreTravelAction({
          geocode: queryParams.geocode,
          user_id: user?.id,
        });
        setFlights(data?.data);
      } catch (error) {
        console.error("Failed to fetch flights", error);
      }
    }

    if (queryParams.geocode.latitude && queryParams.geocode.longitude) {
      fetchFlights();
    }
  }, [queryParams.geocode]);

  return (
    <Map params={queryParams.geocode}>
      <Planes color="blue" flights={flights} />
    </Map>
  );
}
