"use client";

import { generateTravelFilters } from "@/actions/ai/filters/generate-travel-filters";
import { Calendar } from "@travelese/ui/calendar";
import { cn } from "@travelese/ui/cn";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@travelese/ui/dropdown-menu";
import { Icons } from "@travelese/ui/icons";
import { Input } from "@travelese/ui/input";
import { readStreamableValue } from "ai/rsc";
import { formatISO } from "date-fns";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { FilterList } from "./filter-list";

type Props = {
  members?: {
    id: string;
    name: string;
  }[];
};

const defaultSearch = {
  q: null,
  start: null,
  end: null,
  assignees: null,
  statuses: null,
};

const statusFilters = [
  { id: "in_progress", name: "In Progress" },
  { id: "completed", name: "Completed" },
];

export function TravelSearchFilter({ members }: Props) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useQueryStates(
    {
      q: parseAsString,
      start: parseAsString,
      end: parseAsString,
      statuses: parseAsArrayOf(
        parseAsStringLiteral(["in_progress", "completed"]),
      ),
    },
    {
      shallow: false,
    },
  );

  useHotkeys(
    "esc",
    () => {
      setPrompt("");
      setFilters(defaultSearch);
      setIsOpen(false);
    },
    {
      enableOnFormTags: true,
    },
  );

  useHotkeys("meta+s", (evt) => {
    evt.preventDefault();
    inputRef.current?.focus();
  });

  useHotkeys("meta+f", (evt) => {
    evt.preventDefault();
    setIsOpen((prev) => !prev);
  });

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;

    if (value) {
      setPrompt(value);
    } else {
      setFilters(defaultSearch);
      setPrompt("");
    }
  };

  const handleSubmit = async () => {
    // If the user is typing a query with multiple words, we want to stream the results
    if (prompt.split(" ").length > 1) {
      setStreaming(true);

      const { object } = await generateTravelFilters(prompt);

      let finalObject = {};

      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject) {
          finalObject = {
            ...finalObject,
            ...partialObject,
            statuses: partialObject?.status ? [partialObject.status] : null,
            start: partialObject?.start ?? null,
            end: partialObject?.end ?? null,
            q: partialObject?.name ?? null,
          };
        }
      }

      setFilters({
        q: null,
        ...finalObject,
      });

      setStreaming(false);
    } else {
      setFilters({ q: prompt.length > 0 ? prompt : null });
    }
  };

  const hasValidFilters =
    Object.entries(filters).filter(
      ([key, value]) => value !== null && key !== "q",
    ).length > 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex space-x-4 items-center">
        <FilterList
          filters={filters}
          loading={streaming}
          onRemove={setFilters}
          members={members}
          statusFilters={statusFilters}
        />

        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Icons.Search className="absolute pointer-events-none left-3 top-[11px]" />
          <Input
            ref={inputRef}
            placeholder="Search or type filter"
            className="pl-9 w-full md:w-[350px] pr-8"
            value={prompt}
            onChange={handleSearch}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />

          <DropdownMenuTrigger asChild>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              type="button"
              className={cn(
                "absolute z-10 right-3 top-[10px] opacity-50 transition-opacity duration-300 hover:opacity-100",
                hasValidFilters && "opacity-100",
                isOpen && "opacity-100",
              )}
            >
              <Icons.Filter />
            </button>
          </DropdownMenuTrigger>
        </form>
      </div>

      <DropdownMenuContent
        className="w-[350px]"
        align="end"
        sideOffset={19}
        alignOffset={-11}
        side="bottom"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.CalendarMonth className="mr-2 size-4" />
              <span>Date</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                <Calendar
                  mode="range"
                  initialFocus
                  today={filters.start ? new Date(filters.start) : new Date()}
                  toDate={new Date()}
                  selected={{
                    from: filters.start && new Date(filters.start),
                    to: filters.end && new Date(filters.end),
                  }}
                  onSelect={(range) => {
                    if (!range) return;

                    const newRange = {
                      start: range.from
                        ? formatISO(range.from, { representation: "date" })
                        : filters.start,
                      end: range.to
                        ? formatISO(range.to, { representation: "date" })
                        : filters.end,
                    };

                    setFilters(newRange);
                  }}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.BookingStatus className="mr-2 size-4 rotate-180" />
              <span>Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {statusFilters.map(({ id, name }) => (
                  <DropdownMenuCheckboxItem
                    key={id}
                    checked={filters?.statuses?.includes(id)}
                    onCheckedChange={() => {
                      setFilters({
                        statuses: id ? [id] : null,
                      });
                    }}
                  >
                    {name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}