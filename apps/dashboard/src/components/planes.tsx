"use client";

import { useMap } from "@/hooks/use-map";
import type { Flight } from "@/actions/schema";
import { Marker } from "mapbox-gl";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import NyanCat from "@/assets/nyan.gif";

import { mapClickSubscribable } from "@/components/travel-map";
import { PlaneMarker } from "@/components/plane-marker";
import { PlaneTrack } from "@/actions/flight-track";
import Link from "next/link";

/** Based on https://gist.github.com/chriswhong/8977c0d4e869e9eaf06b4e9fda80f3ab */
class ClickableMarker extends Marker {
  _handleClick?: (e: MouseEvent<HTMLDivElement, MouseEvent>) => void;

  // new method onClick, sets _handleClick to a function you pass in
  onClick(handleClick: (e: MouseEvent<HTMLDivElement, MouseEvent>) => void) {
    this._handleClick = handleClick;

    return this;
  }

  // the existing _onMapClick was there to trigger a popup
  // but we are hijacking it to run a function we define
  _onMapClick(e: any) {
    const targetElement = e.originalEvent.target;
    const element = this._element;

    if (
      this._handleClick &&
      (targetElement === element || element.contains(targetElement))
    ) {
      this._handleClick(e.originalEvent);
    }
  }
}

interface PlanesProps {
  color?: string | "nyan";
  flights: Flight[];
}

const colors = {
  blue: "#0070F3",
  red: "#ff5555",
  green: "#66ac66",
  yellow: "#ffff6e",
  purple: "#b32eb3",
};

export function Planes({
  color: selectedColor = "#0070F3",
  flights,
}: PlanesProps) {
  const { map } = useMap();

  const color = selectedColor in colors ? colors[selectedColor] : selectedColor;

  const planeMarkerRef = useRef<HTMLDivElement | null>(null);

  const [selectedPlaneId, setSelectedPlaneId] = useState<string | null>(null);

  const selectedPlaneData = useMemo(() => {
    if (selectedPlaneId === null) return null;

    return flights.find((flight) => flight.fr24_id === selectedPlaneId);
  }, [selectedPlaneId, flights]);

  useEffect(() => {
    if (selectedPlaneId && selectedPlaneData?.lat && selectedPlaneData?.lon) {
      map.flyTo({
        center: [selectedPlaneData.lon, selectedPlaneData.lat],
        duration: 1000,
        zoom: 11,
      });
    }
  }, [selectedPlaneId, selectedPlaneData?.lat, selectedPlaneData?.lon, map]);

  useEffect(() => {
    const planeMarkerEl = planeMarkerRef.current;

    if (!planeMarkerEl) return;

    const planeMarkers = flights.map((plane, index) => {
      const planeMarker = new ClickableMarker({
        element: planeMarkerEl.cloneNode(true) as HTMLElement,
        rotation: plane.track,
      }).setLngLat([plane.lon, plane.lat]);
      planeMarker.addTo(map);

      planeMarker.onClick((e) => {
        e.preventDefault();

        setSelectedPlaneId(plane.fr24_id);
      });
      return planeMarker;
    });

    const suscriptionId = mapClickSubscribable.addCallback((e) => {
      if (!e.defaultPrevented) {
        setSelectedPlaneId(null);
      }
    });

    return () => {
      planeMarkers.forEach((marker) => marker.remove());
      mapClickSubscribable.removeCallback(suscriptionId);
    };
  }, [flights, map]);

  return (
    <>
      <div className="hidden">
        <div
          id="plane-marker"
          ref={planeMarkerRef}
          className="cursor-pointer"
          style={{
            color: color,
          }}
        >
          {color === "nyan" ? (
            <Image
              width={80}
              height={80}
              src="/assets/nyan.gif"
              alt="Nyan Cat"
              className="-rotate-90"
            />
          ) : (
            <PlaneMarker />
          )}
        </div>
      </div>
      {selectedPlaneData && (
        <>
          <div className="fixed bottom-0 w-full left-0 p-2">
            <div className="relative w-full p-4 text-white bg-black rounded-md border border-gray-500">
              <div className="flex justify-between gap-4 items-end">
                <div className="flex flex-col gap-4">
                  <p className="leading-none text-lg">
                    {selectedPlaneData.callsign}
                  </p>
                  <p className="leading-none">
                    <b className="opacity-50">Latitude</b>{" "}
                    {selectedPlaneData.lat}
                  </p>
                  <p className="leading-none">
                    <b className="opacity-50">Longitude</b>{" "}
                    {selectedPlaneData.lon}
                  </p>
                </div>
                <Link
                  href={`/flights/${selectedPlaneData.callsign}`}
                  className="p-2 bg-blue leading-none uppercase text-sm font-mono"
                >
                  Flight details
                </Link>
              </div>
            </div>
          </div>
          <PlaneTrack
            id={selectedPlaneData.fr24_id}
            timestamp={selectedPlaneData.timestamp}
            currentLat={selectedPlaneData.lat}
            currentLon={selectedPlaneData.lon}
          />
        </>
      )}
    </>
  );
}
