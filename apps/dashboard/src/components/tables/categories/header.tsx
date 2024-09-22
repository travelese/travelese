"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@travelese/ui/button";
import { Input } from "@travelese/ui/input";
import type { Category } from "./columns";

type Props = {
  table?: Table<Category[]>;
  onOpenChange?: (isOpen: boolean) => void;
};

export function Header({ table, onOpenChange }: Props) {
  return (
    <div className="flex items-center py-4 justify-between">
      <Input
        placeholder="Search..."
        value={(table?.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table?.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />

      <Button onClick={() => onOpenChange?.(true)}>Create</Button>
    </div>
  );
}
