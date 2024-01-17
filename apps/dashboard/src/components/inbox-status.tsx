"use client";

import { Icons } from "@midday/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@midday/ui/tooltip";

export function InboxStatus({ item }) {
  if (item?.transaction_id) {
    return (
      <div className="flex space-x-1 items-center">
        <Icons.Check />
        <span>Completed</span>
      </div>
    );
  }

  if (item.pending) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex space-x-1 items-center">
              <Icons.Pending />
              <span>Pending</span>
            </div>
          </TooltipTrigger>
          <TooltipContent sideOffset={20} className="text-xs">
            <p>
              We will try to match against incoming <br />
              transactions for up to 45 days
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex space-x-1 items-center">
            <Icons.Error />
            <span>Needs review</span>
          </div>
        </TooltipTrigger>
        <TooltipContent sideOffset={20} className="text-xs">
          <p>
            We could not find a matching transaction
            <br />
            please select the transaction manually
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}