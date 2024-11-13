"use client";

import { Marker } from "mapbox-gl";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useMap } from "../hooks/use-map";
import { geocode } from "../utils/geocode";
import CircleMarker from "./assets/circle-marker.svg";

export function AirportMarker() {
  const circleMarkerRef = useRef<HTMLDivElement | null>(null);

  const map = useMap();

  const { airport } = useParams<{ airport: string }>();

  useEffect(() => {
    const circleMarkerEl = circleMarkerRef.current;
    if (!circleMarkerEl) return;

    const airportGeo = geocode(airport.toLocaleUpperCase());

    const marker = new Marker({
      element: circleMarkerEl.cloneNode(true) as HTMLElement,
    }).setLngLat([airportGeo.longitude, airportGeo.latitude]);

    marker.addTo(map.map);

    return () => {
      marker.remove();
    };
  }, [airport]);

  return (
    <div className="hidden">
      <div ref={circleMarkerRef} className="relative">
        <div className="marker-pulse-container">
          <div className="marker-pulse"></div>
        </div>
        <Image className="relative" src={CircleMarker} alt="Circle Marker" />
      </div>
    </div>
  );
}
