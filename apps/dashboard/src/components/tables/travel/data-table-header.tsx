"use client";

import { Button } from "@travelese/ui/button";
import { TableHead, TableHeader, TableRow } from "@travelese/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function DataTableHeader() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [column, value] = searchParams.get("sort")
    ? searchParams.get("sort")?.split(":")
    : [];

  const createSortQuery = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams);
      const prevSort = params.get("sort");

      if (`${name}:asc` === prevSort) {
        params.set("sort", `${name}:desc`);
      } else if (`${name}:desc` === prevSort) {
        params.delete("sort");
      } else {
        params.set("sort", `${name}:asc`);
      }

      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  return (
    <TableHeader>
      <TableRow className="h-[45px]">
        <TableHead className="w-[400px]">
          <Button
            className="p-0 hover:bg-transparent space-x-2"
            variant="ghost"
            onClick={() => createSortQuery("name")}
          >
            <span>Booking</span>
            {"name" === column && value === "asc" && <ArrowDown size={16} />}
            {"name" === column && value === "desc" && <ArrowUp size={16} />}
          </Button>
        </TableHead>
        <TableHead className="w-[180px]">
          <Button
            className="p-0 hover:bg-transparent space-x-2"
            variant="ghost"
            onClick={() => createSortQuery("time")}
          >
            <span>Total Time</span>
            {"time" === column && value === "asc" && <ArrowDown size={16} />}
            {"time" === column && value === "desc" && <ArrowUp size={16} />}
          </Button>
        </TableHead>
        <TableHead className="w-[160px]">
          <Button
            className="p-0 hover:bg-transparent space-x-2"
            variant="ghost"
            onClick={() => createSortQuery("amount")}
          >
            <span>Total Amount</span>
            {"amount" === column && value === "asc" && <ArrowDown size={16} />}
            {"amount" === column && value === "desc" && <ArrowUp size={16} />}
          </Button>
        </TableHead>
        <TableHead className="w-[330px]">
          <Button
            className="p-0 hover:bg-transparent space-x-2"
            variant="ghost"
            onClick={() => createSortQuery("description")}
          >
            <span className="line-clamp-1 text-ellipsis">Description</span>
            {"description" === column && value === "asc" && (
              <ArrowDown size={16} />
            )}
            {"description" === column && value === "desc" && (
              <ArrowUp size={16} />
            )}
          </Button>
        </TableHead>
        <TableHead className="w-[140px]">
          <Button
            className="p-0 hover:bg-transparent space-x-2"
            variant="ghost"
            onClick={() => createSortQuery("assigned")}
          >
            <span>Assigned</span>
            {"assigned" === column && value === "asc" && (
              <ArrowDown size={16} />
            )}
            {"assigned" === column && value === "desc" && <ArrowUp size={16} />}
          </Button>
        </TableHead>
        <TableHead className="w-[170px]">
          <Button
            className="p-0 hover:bg-transparent space-x-2"
            variant="ghost"
            onClick={() => createSortQuery("status")}
          >
            <span>Status</span>
            {"status" === column && value === "asc" && <ArrowDown size={16} />}
            {"status" === column && value === "desc" && <ArrowUp size={16} />}
          </Button>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}