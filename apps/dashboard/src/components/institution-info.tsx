import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@travelese/ui/tooltip";
import type { ReactNode } from "react";

type Props = {
  provider: string;
  children: ReactNode;
};

export function InstitutionInfo({ provider, children }: Props) {
  const getDescription = () => {
    switch (provider) {
      case "plaid":
        return `With Plaid we can connect to 12,000+ financial institutions across the US, Canada, UK, and Europe are covered by Plaid's network`;
      default:
        break;
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="w-[300px] text-xs" side="right">
          {getDescription()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
