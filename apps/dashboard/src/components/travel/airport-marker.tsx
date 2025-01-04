"use client";

import { useMap } from "@/hooks/use-map";
import { Marker } from "mapbox-gl";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { parseAsJson, useQueryStates } from "nuqs";

export function AirportMarker() {
  const circleMarkerRef = useRef<HTMLDivElement | null>(null);
  const map = useMap();

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
    const circleMarkerEl = circleMarkerRef.current;
    if (!circleMarkerEl) return;

    const { latitude, longitude } = queryParams.geocode;

    const marker = new Marker({
      element: circleMarkerEl.cloneNode(true) as HTMLElement,
    }).setLngLat([longitude, latitude]);

    marker.addTo(map.map);

    return () => {
      marker.remove();
    };
  }, [queryParams.geocode, map.map]);

  return (
    <div className="hidden">
      <div ref={circleMarkerRef} className="relative">
        <div className="marker-pulse-container">
          <div className="marker-pulse"></div>
        </div>
        <Image
          className="relative"
          src="/assets/circle-marker.svg"
          alt="Circle Marker"
          width={23}
          height={23}
        />
      </div>
    </div>
  );
}
