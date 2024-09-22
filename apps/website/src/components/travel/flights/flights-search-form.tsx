"use client";

import {
  CabinField,
  DatesField,
  DestinationField,
  OriginField,
  TravellersField,
} from "@/components/travel/search-form-fields";
import useNavigation from "@/hooks/use-navigation";
import { useSearchForm } from "@/hooks/use-search-form";
import { Button } from "@travelese/ui/button";
import { Form } from "@travelese/ui/form";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function FlightsSearchForm() {
  const [isClient, setIsClient] = useState(false);
  const { navigateToSearchPage } = useNavigation();
  const { form, date, setDate, onSubmit } = useSearchForm(
    "flights",
    navigateToSearchPage,
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = form.getValues();
              onSubmit(formData);
            }}
            className="flex flex-col sm:flex-row lg:flex-row xl:flex-row gap-2 p-4"
          >
            <div className="flex flex-col sm:flex-row gap-1 flex-grow">
              <OriginField control={form.control} />
              <DestinationField control={form.control} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 flex-grow">
              <DatesField
                control={form.control}
                date={date}
                setDate={(newDate) => {
                  if (newDate instanceof Function) {
                    setDate(newDate(date));
                  } else {
                    setDate(newDate);
                  }
                }}
              />
              <TravellersField control={form.control} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <CabinField control={form.control} />
              <div className="flex-1 w-full min-w-[100px]">
                <Button type="submit" className="w-full h-full">
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
