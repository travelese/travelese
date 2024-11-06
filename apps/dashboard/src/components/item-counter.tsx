"use client";

import { useI18n } from "@/locales/client";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";

interface ItemType {
  id: string;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}

interface ItemCounterProps {
  items: ItemType[];
  value: Record<string, number>;
  onChange: (newCounts: Record<string, number>) => void;
  disabled?: boolean;
}

export function ItemCounter({
  items,
  value,
  onChange,
  disabled = false,
}: ItemCounterProps) {
  const t = useI18n();

  const handleCountChange = (id: string, change: number) => {
    const newCounts = {
      ...value,
      [id]: Math.max(0, (value[id] || 0) + change),
    };
    onChange(newCounts);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            {items.map((item) => (
              <span key={item.id} className="flex items-center space-x-1">
                <span className="mr-1">{item.icon}</span>
                {value[item.id] || 0}
              </span>
            ))}
          </div>
          <div className="flex-grow" />
          <Icons.ChevronDown className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px]" sideOffset={10}>
        <div className="space-y-4 mx-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex flex-col">
                <span className="text-sm">{t(item.label)}</span>
                <span className="text-xs text-muted-foreground">
                  {t(item.subLabel)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCountChange(item.id, -1)}
                  disabled={!value[item.id]}
                  aria-label={`Decrease ${item.label} count`}
                  className="h-8 w-8"
                >
                  <Icons.Minus className="size-4" />
                </Button>
                <div className="w-8 text-center">{value[item.id] || 0}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCountChange(item.id, 1)}
                  aria-label={`Increase ${item.label} count`}
                  className="h-8 w-8"
                >
                  <Icons.Plus className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
