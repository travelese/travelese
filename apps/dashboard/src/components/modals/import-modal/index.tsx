"use client";

import { importTransactionsAction } from "@/actions/transactions/import-transactions";
import { useUpload } from "@/hooks/use-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@travelese/supabase/client";
import { getCurrentUserTeamQuery } from "@travelese/supabase/queries";
import { AnimatedSizeContainer } from "@travelese/ui/animated-size-container";
import { Button } from "@travelese/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@travelese/ui/dialog";
import { Icons } from "@travelese/ui/icons";
import { useToast } from "@travelese/ui/use-toast";
import { stripSpecialCharacters } from "@travelese/utils";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { auth } from "@trigger.dev/sdk/v3";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ImportCsvContext,
  type ImportCsvFormData,
  importSchema,
} from "./context";
import { FieldMapping } from "./field-mapping";
import { SelectFile } from "./select-file";

const pages = ["select-file", "confirm-import"] as const;

type Props = {
  currencies: string[];
  defaultCurrency: string;
};

export function ImportModal({ currencies, defaultCurrency }: Props) {
  const [eventId, setEventId] = useState<string | undefined>();
  const [publicToken, setPublicToken] = useState<string | undefined>();
  const [isImporting, setIsImporting] = useState(false);
  const [fileColumns, setFileColumns] = useState<string[] | null>(null);
  const [firstRows, setFirstRows] = useState<Record<string, string>[] | null>(
    null,
  );

  const [pageNumber, setPageNumber] = useState<number>(0);
  const page = pages[pageNumber];

  const supabase = createClient();
  const { uploadFile } = useUpload();

  const { toast } = useToast();
  const router = useRouter();

  const { run: runData } = publicToken
    ? useRealtimeRun(eventId ?? "")
    : { run: null };

  const status = runData?.status;
  const error = status === "FAILED" || status === "TIMED_OUT";

  const [params, setParams] = useQueryStates({
    step: parseAsString,
    accountId: parseAsString,
    type: parseAsString,
    hide: parseAsBoolean.withDefault(false),
  });

  const isOpen = params.step === "import";

  const importTransactions = useAction(importTransactionsAction, {
    onSuccess: ({ data }) => {
      if (data?.id) {
        setEventId(data.id);
        setPublicToken(data.publicToken);
      }
    },
    onError: () => {
      setIsImporting(false);
      setEventId(undefined);
      toast({
        duration: 3500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<ImportCsvFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      currency: defaultCurrency,
      bank_account_id: params.accountId ?? undefined,
      inverted: params.type === "credit",
    },
  });

  const file = watch("file");

  const onclose = () => {
    setFileColumns(null);
    setFirstRows(null);
    setPageNumber(0);
    reset();

    setParams({
      step: null,
      accountId: null,
      type: null,
      hide: null,
    });
  };

  useEffect(() => {
    if (params.accountId) {
      setValue("bank_account_id", params.accountId);
    }
  }, [params.accountId]);

  useEffect(() => {
    if (params.type) {
      setValue("inverted", params.type === "credit");
    }
  }, [params.type]);

  useEffect(() => {
    if (error) {
      setIsImporting(false);
      setEventId(undefined);

      toast({
        duration: 3500,
        variant: "error",
        title: "Something went wrong please try again or contact support.",
      });
    }
  }, [error]);

  useEffect(() => {
    if (status === "COMPLETED") {
      setEventId(undefined);
      setIsImporting(false);
      onclose();
      router.refresh();

      toast({
        duration: 3500,
        variant: "success",
        title: "Transactions imported successfully.",
      });
    }
  }, [status]);

  // Go to second page if file looks good
  useEffect(() => {
    if (file && fileColumns && pageNumber === 0) {
      setPageNumber(1);
    }
  }, [file, fileColumns, pageNumber]);

  // Configure auth when publicToken is available
  useEffect(() => {
    if (publicToken) {
      auth.configure({ accessToken: publicToken });
    }
  }, [publicToken]);

  return (
    <Dialog open={isOpen} onOpenChange={onclose}>
      <DialogContent>
        <div className="p-4 pb-0">
          <DialogHeader>
            <div className="flex space-x-4 items-center mb-4">
              {!params.hide && (
                <button
                  type="button"
                  className="items-center border bg-accent p-1"
                  onClick={() => setParams({ step: "connect" })}
                >
                  <Icons.ArrowBack />
                </button>
              )}
              <DialogTitle className="m-0 p-0">
                {page === "select-file" && "Select file"}
                {page === "confirm-import" && "Confirm import"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {page === "select-file" &&
                "Upload a CSV file or a screenshot of your transactions."}
              {page === "confirm-import" &&
                "We’ve mapped each column to what we believe is correct, but please review the data below to confirm it’s accurate."}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <AnimatedSizeContainer height>
              <ImportCsvContext.Provider
                value={{
                  fileColumns,
                  setFileColumns,
                  firstRows,
                  setFirstRows,
                  control,
                  watch,
                  setValue,
                }}
              >
                <div>
                  <form
                    className="flex flex-col gap-y-4"
                    onSubmit={handleSubmit(async (data) => {
                      let filePath = undefined;

                      setIsImporting(true);

                      if (data.import_type === "csv") {
                        const { data: userData } =
                          await getCurrentUserTeamQuery(supabase);

                        const filename = stripSpecialCharacters(data.file.name);
                        const { path } = await uploadFile({
                          bucket: "vault",
                          path: [userData?.team_id, "imports", filename],
                          file,
                        });

                        filePath = path;
                      }

                      importTransactions.execute({
                        filePath,
                        currency: data.currency,
                        bankAccountId: data.bank_account_id,
                        currentBalance: data.balance,
                        inverted: data.inverted,
                        dateAdjustment: data.date_adjustment,
                        table: data.table,
                        importType: data.import_type,
                        mappings: {
                          amount: data.amount,
                          date: data.date,
                          description: data.description,
                        },
                      });
                    })}
                  >
                    {page === "select-file" && <SelectFile />}
                    {page === "confirm-import" && (
                      <>
                        <FieldMapping currencies={currencies} />

                        <Button
                          disabled={!isValid || isImporting}
                          className="mt-4"
                        >
                          {isImporting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            "Confirm import"
                          )}
                        </Button>

                        <button
                          type="button"
                          className="text-sm mb-4 text-[#878787]"
                          onClick={() => {
                            setPageNumber(0);
                            reset();
                            setFileColumns(null);
                            setFirstRows(null);
                          }}
                        >
                          Choose another file
                        </button>
                      </>
                    )}
                  </form>
                </div>
              </ImportCsvContext.Provider>
            </AnimatedSizeContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
