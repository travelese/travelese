"use client";

import {
  DatesField,
  DestinationField,
  RoomsField,
  TravellersField,
} from "@/components/travel/search-form-fields";
import useNavigation from "@/hooks/use-navigation";
import { Button } from "@travelese/ui/button";
import { Form } from "@travelese/ui/form";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchForm } from "../../../../../dashboard/src/hooks/use-search-form";

export default function StaySearchForm() {
  const [isClient, setIsClient] = useState(false);
  const { navigateToSearchPage } = useNavigation();
  const { form, date, setDate, onSubmit } = useSearchForm(
    "stay",
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
              <DestinationField control={form.control} searchType="stay" />
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
              <TravellersField control={form.control} searchType="stay" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <RoomsField control={form.control} />
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
