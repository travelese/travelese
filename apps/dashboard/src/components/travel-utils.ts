import type { BaggageType, OfferSliceSegment } from "@duffel/api/types";
import { format } from "date-fns";

export const formatTime = (dateTime: string | undefined) =>
  dateTime ? format(new Date(dateTime), "HH:mm") : "N/A";

export const formatDate = (dateTime: string | undefined) =>
  dateTime ? format(new Date(dateTime), "dd MMM") : "N/A";

export const formatDateTime = (dateTime: string | undefined) =>
  dateTime ? format(new Date(dateTime), "dd MMM, HH:mm") : "N/A";

export const formatDuration = (isoDuration: string | null): string => {
  if (!isoDuration) return "N/A";
  const matches = isoDuration.match(
    /P(?:([0-9]+)Y)?(?:([0-9]+)M)?(?:([0-9]+)D)?T(?:([0-9]+)H)?(?:([0-9]+)M)?/,
  );
  if (!matches) return "N/A";
  const hours = matches[4] ? `${matches[4]}h` : "0h";
  const minutes = matches[5] ? `${matches[5]}m` : "0m";
  return `${hours} ${minutes}`;
};

export const calculateDayDifference = (
  startDate: string,
  endDate: string,
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays - 1;
};

export const calculateLayoverDuration = (
  currentSegment: OfferSliceSegment,
  nextSegment: OfferSliceSegment | undefined,
): string => {
  if (!nextSegment) return "";
  const layoverStart = new Date(currentSegment.arriving_at);
  const layoverEnd = new Date(nextSegment.departing_at);
  const durationMs = layoverEnd.getTime() - layoverStart.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `PT${hours}H${minutes}M`;
};

export const countBagType = (
  type: BaggageType,
  segments: OfferSliceSegment[] | undefined,
): number => {
  if (!segments?.length) return 0;
  return segments[0]?.passengers.reduce((total, passenger) => {
    const count = passenger.baggages?.find(
      (bag) => bag.type === type,
    )?.quantity;
    return total + (count || 0);
  }, 0);
};
