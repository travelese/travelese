import { createPlaidLinkTokenAction } from "@/actions/institutions/create-plaid-link";
import { isDesktopApp } from "@todesktop/client-core/platform/todesktop";
import { Button } from "@travelese/ui/button";
import { Icons } from "@travelese/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@travelese/ui/tooltip";
import { useToast } from "@travelese/ui/use-toast";
import { useScript } from "@uidotdev/usehooks";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

type Props = {
  id: string;
  provider: string;
  enrollmentId: string | null;
  institutionId: string;
  accessToken: string | null;
  onManualSync: () => void;
  variant?: "button" | "icon";
};

export function ReconnectProvider({
  id,
  provider,
  enrollmentId,
  institutionId,
  accessToken,
  onManualSync,
  variant,
}: Props) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [plaidToken, setPlaidToken] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const { open: openPlaid } = usePlaidLink({
    token: plaidToken,
    publicKey: "",
    env: process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT!,
    clientName: "Travelese",
    product: ["transactions"],
    onSuccess: () => {
      setPlaidToken(undefined);
      onManualSync();
    },
    onExit: () => {
      setPlaidToken(undefined);
    },
  });

  useEffect(() => {
    if (plaidToken) {
      openPlaid();
    }
  }, [plaidToken, openPlaid]);

  const handleOnClick = async () => {
    switch (provider) {
      case "plaid": {
        const token = await createPlaidLinkTokenAction(
          accessToken ?? undefined,
        );

        if (token) {
          setPlaidToken(token);
        }

        return;
      }
      default:
        return;
    }
  };

  if (variant === "button") {
    return (
      <Button variant="outline" onClick={handleOnClick} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          "Reconnect"
        )}
      </Button>
    );
  }

  return (
    <TooltipProvider delayDuration={70}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-7 h-7 flex items-center"
            onClick={handleOnClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Icons.Reconnect size={16} />
            )}
          </Button>
        </TooltipTrigger>

        <TooltipContent className="px-3 py-1.5 text-xs" sideOffset={10}>
          Reconnect
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
