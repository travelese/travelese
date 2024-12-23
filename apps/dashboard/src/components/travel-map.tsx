"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "@/hooks/use-map";
import { subscribable } from "@/utils/subscribable";
import type { MapType } from "@/utils/types";
import {
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AirportMarker } from "./airport-marker";
import { parseAsJson, parseAsString, useQueryStates } from "nuqs";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

if (!mapboxToken) throw new Error("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set");

const INITIAL_ZOOM = 9;

export const mapClickSubscribable =
  subscribable<(e: MouseEvent<HTMLDivElement>) => void>();

interface MapProviderProps {
  children?: ReactNode;
  mapContainerRef: React.RefObject<HTMLDivElement>;
}

export function MapProvider({ children, mapContainerRef }: MapProviderProps) {
  const mapRef = useRef<MapType | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const [queryParams] = useQueryStates({
    geo_code: parseAsJson<{
      latitude: number;
      longitude: number;
    }>().withDefault({
      latitude: 0,
      longitude: 0,
    }),
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const { latitude, longitude } = queryParams.geo_code;
    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [longitude, latitude],
      zoom: INITIAL_ZOOM,
      attributionControl: false,
      logoPosition: "bottom-right",
      style: "mapbox://styles/mapbox/dark-v11",
    });

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      if (map) map.remove();
    };
  }, []);

  if (!isMapReady) return null;

  return (
    <div className="z-[1000] relative">
      <MapContext.Provider value={{ map: mapRef.current! }}>
        {children}
      </MapContext.Provider>
    </div>
  );
}

interface MapProps {
  params: {
    geo_code: {
      latitude: number;
      longitude: number;
    };
    iata_code: string;
  };
}

export function TravelMap({ children }: PropsWithChildren<MapProps>) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const handleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    mapClickSubscribable.runCallbacks(e);
  }, []);

  return (
    <div className="w-screen h-screen" onClick={handleClick}>
      <div className="relative w-full h-full">
        <div
          id="map-container"
          ref={mapContainerRef}
          className="absolute inset-0 h-full w-full"
        />
        <MapProvider mapContainerRef={mapContainerRef}>
          <AirportMarker />
          {children}
        </MapProvider>
      </div>
    </div>
  );
}
