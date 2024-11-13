import { getBoundsOfDistance } from "geolib";
import { MAP_RADIUS } from "./constants";

export function getMapBounds(
  latitude: number,
  longitude: number,
  shift?: [number, number],
) {
  const [southWest, northEast] = getBoundsOfDistance(
    { latitude, longitude },
    MAP_RADIUS,
  );

  if (shift) {
    const width = northEast?.longitude! - southWest?.longitude!;
    const height = northEast?.latitude! - southWest?.latitude!;

    southWest!.longitude += shift[0] * width;
    southWest!.latitude += shift[1] * height;
    northEast!.longitude += shift[0] * width;
    northEast!.latitude += shift[1] * height;
  }

  return { southWest, northEast };
}

export type MapBounds = ReturnType<typeof getMapBounds>;
