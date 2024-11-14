"use client";

import { shareFileAction } from "@/actions/share-file-action";
import { useExportStore } from "@/store/export";
import { Button } from "@travelese/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@travelese/ui/dropdown-menu";
import { Icons } from "@travelese/ui/icons";
import { useToast } from "@travelese/ui/use-toast";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import ms from "ms";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";

const options = [
  {
    label: "Expire in 1 week",
    expireIn: ms("7d"),
  },
  {
    label: "Expire in 1 month",
    expireIn: ms("30d"),
  },
  {
    label: "Expire in 1 year",
    expireIn: ms("1y"),
  },
];

export function ExportStatus() {
  const { toast, dismiss, update } = useToast();
  const [toastId, setToastId] = useState(null);
  const { exportId, setExportId } = useExportStore();
  const { error, run } = useRealtimeRun(exportId ?? "");

  const shareFile = useAction(shareFileAction, {
    onError: () => {
      toast({
        duration: 2500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
    onSuccess: async ({ data }) => {
      await navigator.clipboard.writeText(data ?? "");

      toast({
        duration: 2500,
        title: "Copied URL to clipboard.",
        variant: "success",
      });
    },
  });

  const handleOnDownload = (id: string) => {
    dismiss(id);
  };

  const handleOnShare = ({
    id,
    expireIn,
    filename,
  }: {
    id: string;
    expireIn: number;
    filename: string;
  }) => {
    shareFile.execute({ expireIn, filepath: `exports/${filename}` });
    dismiss(id);
  };

  useEffect(() => {
    if (exportId && !toastId) {
      const { id } = toast({
        title: "Exporting transactions.",
        variant: "progress",
        description: "Please do not close browser until completed",
        duration: 8000,
        progress: 0,
      });

      setToastId(id);
    } else {
      update(toastId, {
        progress: run?.output?.progress,
      });
    }

    if (run?.output?.progress === 100) {
      const { id } = toast({
        title: "Export completed",
        description: `Your export is ready based on ${run?.output?.totalItems} transactions. It's stored in your Vault.`,
        duration: Number.POSITIVE_INFINITY,
        footer: (
          <div className="mt-4 flex space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="border space-x-2"
                >
                  <span>Share URL</span>
                  <Icons.ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-[100]">
                {options.map((option, idx) => (
                  <DropdownMenuItem
                    key={idx.toString()}
                    onClick={() =>
                      handleOnShare({
                        id,
                        expireIn: option.expireIn,
                        filename: run?.output?.fileName,
                      })
                    }
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <a
              href={`/api/download/file?path=exports/${run?.output?.fileName}&filename=${run?.output?.fileName}`}
              download
            >
              <Button size="sm" onClick={() => handleOnDownload(id)}>
                Download
              </Button>
            </a>
          </div>
        ),
      });

      setToastId(null);
      setExportId(undefined);
    }
  }, [exportId, toastId, status]);

  useEffect(() => {
    if (error) {
      toast({
        duration: 2500,
        variant: "error",
        title: "Something went wrong please try again.",
      });

      setToastId(null);
      setExportId(undefined);
    }
  }, [error]);

  return null;
}
