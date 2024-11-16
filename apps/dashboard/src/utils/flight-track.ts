import { useMap } from "@/hooks/use-map";
import { useStateToRef } from "@/hooks/use-state-to-ref";
import { getFlightTracks } from "@/utils/get-flight-tracks";
import { useEffect } from "react";

export function PlaneTrack({
  id,
  timestamp,
  currentLat,
  currentLon,
}: { id: string; timestamp: string; currentLat: number; currentLon: number }) {
  const { map } = useMap();

  const mapRef = useStateToRef(map);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    let sourceId: string | null = null;
    let layerId: string | null = null;

    getFlightTracks(id)
      .then((response) => {
        if (signal.aborted) return;

        const filteredTracks = response.filter(
          (track) => new Date(track.timestamp) <= new Date(timestamp),
        );

        sourceId = `route-${id}`;
        layerId = `route-layer-${id}`;

        mapRef.current?.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: filteredTracks
                .map((track) => [track.lon, track.lat])
                .concat([[currentLon, currentLat]]),
            },
          },
        });

        mapRef.current?.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#5a91ff",
            "line-width": 3,
            "line-opacity": 0,
            "line-opacity-transition": {
              duration: 200,
            },
          },
        });

        setTimeout(() => {
          if (signal.aborted || !layerId) return;

          mapRef.current?.setPaintProperty(layerId, "line-opacity", 1);
        }, 50);
      })
      .catch((_e) => {
        // ignore
      });

    return () => {
      controller.abort();
      try {
        if (layerId && sourceId && mapRef.current) {
          if (typeof mapRef.current?.removeLayer === "function") {
            mapRef.current?.removeLayer(layerId);
          }
          if (typeof mapRef.current?.removeSource === "function") {
            mapRef.current?.removeSource(sourceId);
          }
        }
      } catch (e) {
        // ignore
      }
    };
  }, [mapRef, id, timestamp, currentLat, currentLon]);

  return null;
}
