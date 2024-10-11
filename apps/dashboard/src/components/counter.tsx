import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";

interface CounterProps {
  label: string;
  subLabel: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function Counter({
  label,
  subLabel,
  value,
  onIncrement,
  onDecrement,
}: CounterProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">{subLabel}</span>
      </div>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={onDecrement}
          disabled={value === 0}
          className="h-8 w-8"
        >
          <Icons.Minus className="h-4 w-4" />
        </Button>
        <span className="mx-4 w-6 text-center">{value}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={onIncrement}
          className="h-8 w-8"
        >
          <Icons.Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
