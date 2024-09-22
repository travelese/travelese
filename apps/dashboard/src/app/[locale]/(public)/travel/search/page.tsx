"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@travelese/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@travelese/ui/select";
import { Skeleton } from "@travelese/ui/skeleton";

import { FilterIcon, ListOrderedIcon } from "lucide-react";

import SearchFilters from "@/components/travel/search-filters";
import SearchSkeleton from "@/components/travel/search-skeleton";
import useNavigation from "@/hooks/use-navigation";
import type {
  Offer,
  StaysAccommodation,
  StaysSearchResult,
} from "@duffel/api/types";
import { toast } from "sonner";

type FlightsSortValues = "total_amount" | "total_duration";
type StaysSortValues = "price" | "rating";
type SortValues = FlightsSortValues | StaysSortValues;

type SearchResult = Offer | StaysSearchResult;

export default function SearchResult() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);
  const { navigateToBookPage } = useNavigation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const searchParams = useSearchParams();
  const router = useRouter();
  const searchType = (searchParams.get("type") as "fly" | "stay") || "fly";

  const sortBy =
    (searchParams.get("sortBy") as SortValues) ||
    (searchType === "fly" ? "total_amount" : "price");
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

  const setSortBy = (value: SortValues) => {
    const current = new URLSearchParams(searchParams);
    current.set("sortBy", value);
    router.push(`?${current.toString()}`);
  };

  const handleSelect = (result: Offer | StaysAccommodation) => {
    if ("slices" in result) {
      navigateToBookPage(result);
    } else {
      console.log("Navigate to stay booking page");
    }
  };

  useEffect(() => {
    if (limit < 1) {
      setError(new Error("Limit must be at least 1"));
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams);

        if (searchType === "fly") {
          params.set("limit", limit.toString());
        } else {
          params.delete("limit");
        }

        const endpoint =
          searchType === "fly"
            ? "/api/travel/fly/search"
            : "/api/travel/stay/search";
        const response = await fetch(`${endpoint}?${params?.toString()}`);

        if (!response.ok) {
          console.error("Failed to fetch results:", response.statusText);
          throw new Error(`Failed to fetch ${searchType} results`);
        }

        const data = await response.json();
        if (searchType === "fly") {
          setResults(data);
        } else {
          setResults(Array.isArray(data) ? data : data.results || []);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error);
          console.error(`Error fetching ${searchType} results:`, error.message);
        } else {
          console.error("An unknown error occurred.");
          setError(new Error("An unknown error occurred."));
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, [searchParams, limit, searchType]);

  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) {
    const skeletonCount = limit < 10 ? limit : 10;
    return (
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 min-h-screen p-4 md:p-6 lg:p-10 border">
        <div className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-72" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="grid gap-4">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <SearchSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    toast.error(
      <div className="flex items-center gap-2">
        <span>{error.message}</span>
      </div>,
    );
  }

  return (
    <main className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 min-h-screen p-4 md:p-6 lg:p-10 border">
      <div className="md:hidden mb-4">
        <Button onClick={() => setIsFilterOpen(!isFilterOpen)}>
          <FilterIcon className="w-4 h-4 mr-2" />
          {isFilterOpen ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>
      {(isFilterOpen || window.innerWidth >= 768) && (
        <div className="space-y-6">
          <div className="grid gap-4">
            <h2 className="text-2xl font-bold">Filters</h2>
            <SearchFilters results={results} />
          </div>
        </div>
      )}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Search Results</h1>
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ListOrderedIcon className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {searchType === "fly" ? (
                  <>
                    <SelectItem value="total_amount">Total Amount</SelectItem>
                    <SelectItem value="total_duration">
                      Total Duration
                    </SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4">
          {paginatedResults.map((result) => {
            if (searchType === "fly" && "slices" in result) {
              return (
                <FlyCard
                  key={result.id}
                  offer={result}
                  onSelect={() => handleSelect(result)}
                />
              );
            } else if (searchType === "stay" && "accommodation" in result) {
              return (
                <StayCard
                  key={result.id}
                  stay={result}
                  onSelect={() => handleSelect(result.accommodation)}
                />
              );
            }
            return null;
          })}
        </div>
        <div className="flex justify-between mt-6">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            disabled={currentPage * itemsPerPage >= results.length}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}
