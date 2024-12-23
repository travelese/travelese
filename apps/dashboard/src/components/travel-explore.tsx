"use client";

import { exploreTravelAction } from "@/actions/explore-travel-action";
import { TravelMap } from "@/components/travel-map";
import { Planes } from "@/components/planes";
import { parseAsJson, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";

export default function TravelExplore() {
  const [flights, setFlights] = useState([]);
  const [queryParams] = useQueryStates({
    geo_code: parseAsJson<{
      latitude: number;
      longitude: number;
    }>().withDefault({
      latitude: 0,
      longitude: 0,
    }),
    iata_code: parseAsString.withDefault(""),
  });

  useEffect(() => {
    async function fetchFlights() {
      try {
        const data = await exploreTravelAction({
          geo_code: queryParams.geo_code,
          iata_code: queryParams.iata_code,
        });
        setFlights(data?.data);
      } catch (error) {
        console.error("Failed to fetch flights", error);
      }
    }

    if (queryParams.geo_code.latitude && queryParams.geo_code.longitude) {
      fetchFlights();
    }
  }, [queryParams.geo_code, queryParams.iata_code]);

  return (
    <TravelMap params={queryParams}>
      <Planes color="blue" flights={flights} />
    </TravelMap>
  );
}
