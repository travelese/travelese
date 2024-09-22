import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { StarIcon } from "lucide-react";
import { Offer, StaysSearchResult } from "@duffel/api/types";

type SearchResult = Offer | StaysSearchResult;

interface SearchFiltersProps {
  results: SearchResult[];
}

type FilterConfig = {
  type: "checkbox" | "range" | "star";
  label: string;
  options?: string[];
  min?: number;
  max?: number;
};

type FilterValue = string[] | number[];
type Filters = Record<string, FilterValue>;

const filterConfigs: Record<"fly" | "stay", Record<string, FilterConfig>> = {
  fly: {
    departureTime: {
      type: "checkbox",
      label: "Departure Time",
      options: [
        "Morning (6am - 12pm)",
        "Afternoon (12pm - 6pm)",
        "Evening (6pm - 12am)",
        "Night (12am - 6am)",
      ],
    },
    arrivalTime: {
      type: "checkbox",
      label: "Arrival Time",
      options: [
        "Morning (6am - 12pm)",
        "Afternoon (12pm - 6pm)",
        "Evening (6pm - 12am)",
        "Night (12am - 6am)",
      ],
    },
    stops: {
      type: "checkbox",
      label: "Stops",
      options: ["Direct", "1 Stop", "2+ Stops"],
    },
    airlines: {
      type: "checkbox",
      label: "Airlines",
      options: [], // This will be populated dynamically
    },
    priceRange: {
      type: "range",
      label: "Price Range",
      min: 0,
      max: 1000,
    },
  },
  stay: {
    priceRange: {
      type: "range",
      label: "Price Range",
      min: 0,
      max: 1000,
    },
    starRating: {
      type: "star",
      label: "Star Rating",
      options: ["5", "4", "3", "2", "1"],
    },
    amenities: {
      type: "checkbox",
      label: "Amenities",
      options: [
        "Free WiFi",
        "Parking",
        "Swimming Pool",
        "Fitness Center",
        "Restaurant",
        "Room Service",
      ],
    },
    propertyType: {
      type: "checkbox",
      label: "Property Type",
      options: ["Hotel", "Apartment", "Resort", "Villa", "Hostel"],
    },
  },
};

export default function SearchFilters({ results }: SearchFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchType = (searchParams.get("type") as "fly" | "stay") || "fly";

  const [filters, setFilters] = useState<Filters>({});
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  useEffect(() => {
    if (results.length > 0) {
      const newFilters: Filters = {};
      const config = filterConfigs[searchType];

      Object.keys(config).forEach((key) => {
        const paramValue = searchParams.get(key);
        if (paramValue) {
          newFilters[key] =
            config[key].type === "range"
              ? paramValue.split(",").map(Number)
              : paramValue.split(",");
        } else {
          newFilters[key] =
            config[key].type === "range"
              ? [config[key].min || 0, config[key].max || 1000]
              : [];
        }
      });

      setFilters(newFilters);

      if (searchType === "fly") {
        const flyResults = results as Offer[];
        const uniqueAirlines = [
          ...new Set(
            flyResults.flatMap((offer) =>
              offer.slices.flatMap((slice) =>
                slice.segments.map((segment) => segment.operating_carrier.name),
              ),
            ),
          ),
        ];
        filterConfigs.fly.airlines.options = uniqueAirlines;

        const maxOfferPrice = Math.max(
          ...flyResults.map((offer) => parseFloat(offer.total_amount)),
        );
        setMaxPrice(Math.ceil(maxOfferPrice / 100) * 100);
      } else {
        const stayResults = results as StaysSearchResult[];
        const maxStayPrice = Math.max(
          ...stayResults.map((stay) =>
            parseFloat(stay.accommodation.cheapest_rate_total_amount),
          ),
        );
        setMaxPrice(Math.ceil(maxStayPrice / 100) * 100);
      }
    }
  }, [results, searchType, searchParams]);

  const applyFilters = (newFilters: Filters) => {
    const current = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value.length > 0) {
        current.set(key, value.join(","));
      } else {
        current.delete(key);
      }
    });
    router.push(`?${current.toString()}`);
  };

  const handleFilterChange = (
    category: string,
    value: string | number | (string | number)[],
  ) => {
    const newFilters = { ...filters };
    const config = filterConfigs[searchType][category];

    if (config.type === "range") {
      newFilters[category] = Array.isArray(value)
        ? (value as number[])
        : [value as number, (newFilters[category] as number[])[1]];
    } else {
      const currentValues = newFilters[category] as string[];
      if (Array.isArray(value)) {
        newFilters[category] = value as string[];
      } else {
        const stringValue = value.toString();
        if (currentValues.includes(stringValue)) {
          newFilters[category] = currentValues.filter((v) => v !== stringValue);
        } else {
          newFilters[category] = [...currentValues, stringValue];
        }
      }
    }

    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const renderFilter = (key: string, config: FilterConfig) => {
    const filterValue = filters[key];
    if (!filterValue) return null;

    switch (config.type) {
      case "checkbox":
        return (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger>{config.label}</AccordionTrigger>
            <AccordionContent>
              {config.options?.map((option) => (
                <Label
                  key={option}
                  className="flex items-center space-x-2 pt-2"
                >
                  <Checkbox
                    checked={(filterValue as string[]).includes(option)}
                    onCheckedChange={() => handleFilterChange(key, option)}
                  />
                  <span>{option}</span>
                </Label>
              ))}
            </AccordionContent>
          </AccordionItem>
        );
      case "range":
        const [min, max] = filterValue as number[];
        return (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger>{config.label}</AccordionTrigger>
            <AccordionContent>
              <Slider
                min={config.min}
                max={config.max}
                step={10}
                value={[min, max]}
                onValueChange={(value) => handleFilterChange(key, value)}
                className="w-full pt-2 pb-2"
              />
              <div className="flex justify-between mt-2">
                <Input
                  type="number"
                  value={min}
                  onChange={(e) =>
                    handleFilterChange(key, [parseInt(e.target.value), max])
                  }
                  className="w-20"
                />
                <Input
                  type="number"
                  value={max}
                  onChange={(e) =>
                    handleFilterChange(key, [min, parseInt(e.target.value)])
                  }
                  className="w-20"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      case "star":
        return (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger>{config.label}</AccordionTrigger>
            <AccordionContent>
              {config.options?.map((rating) => (
                <Label
                  key={rating}
                  className="flex items-center space-x-2 pt-2"
                >
                  <Checkbox
                    checked={(filterValue as string[]).includes(rating)}
                    onCheckedChange={() => handleFilterChange(key, rating)}
                  />
                  <span className="flex items-center">
                    {Array.from({ length: parseInt(rating) }).map(
                      (_, index) => (
                        <StarIcon
                          key={index}
                          className="w-4 h-4 text-muted-foreground"
                        />
                      ),
                    )}
                  </span>
                </Label>
              ))}
            </AccordionContent>
          </AccordionItem>
        );
    }
  };

  return (
    <Accordion type="multiple" className="w-full">
      {Object.entries(filterConfigs[searchType]).map(([key, config]) =>
        renderFilter(key, config),
      )}
    </Accordion>
  );
}
