"use client";

import { cn } from "@travelese/ui/cn";
import { TableCell, TableRow } from "@travelese/ui/table";
import { flexRender, type Row } from "@tanstack/react-table";
import type { Traveller } from "./columns";

type Props = {
  row: Row<Customer>;
  setOpen: (id?: string) => void;
};

export function TravellerRow({ row, setOpen }: Props) {
  return (
    <>
      <TableRow
        className="hover:bg-transparent cursor-default h-[45px]"
        key={row.id}
      >
        {row.getVisibleCells().map((cell, index) => (
          <TableCell
            key={cell.id}
            onClick={() => ![3, 4, 6].includes(index) && setOpen(row.id)}
            className={cn(index !== 0 && "hidden md:table-cell")}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </>
  );
}