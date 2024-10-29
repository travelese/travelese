"use client";

import { createTravelShareAction } from "@/actions/create-travel-share-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@travelese/ui/button";
import { Calendar } from "@travelese/ui/calendar";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@travelese/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@travelese/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import { useToast } from "@travelese/ui/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CopyInput } from "./copy-input";

const formSchema = z.object({
  expireAt: z.date().optional(),
});

type Props = {
  defaultValue: {
    from: string;
    to: string;
  };
  type: "one_way" | "return" | "multi_city" | "nomad";
  setOpen: (open: boolean) => void;
};

export function ShareTravel({ defaultValue, type, setOpen }: Props) {
  const { toast, dismiss } = useToast();

  const searchParams = useSearchParams();
  const from = searchParams?.get("from") ?? defaultValue.from;
  const to = searchParams?.get("to") ?? defaultValue.to;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    createTravelShare.execute({
      baseUrl: window.location.origin,
      from,
      to,
      type,
      expiresAt: data.expireAt && new Date(data.expireAt).toISOString(),
    });
  }

  const createTravelShare = useAction(createTravelShareAction, {
    onError: () => {
      toast({
        duration: 2500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
    onSuccess: ({ data }) => {
      setOpen(false);

      const { id } = toast({
        title: "Travel itinerary shared",
        description: "Your travel itinerary is ready to share.",
        variant: "success",
        footer: (
          <div className="mt-4 space-x-2 flex w-full">
            <CopyInput
              value={data.short_link}
              className="border-[#2C2C2C] w-full"
            />

            <Link href={data.short_link} onClick={() => dismiss(id)}>
              <Button>View</Button>
            </Link>
          </div>
        ),
      });
    },
  });

  return (
    <DialogContent className="sm:max-w-[425px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-8">
          <DialogHeader>
            <DialogTitle>Share travel itinerary</DialogTitle>
            <DialogDescription>
              Share your {type} travel itinerary from {from} to {to}.
            </DialogDescription>
          </DialogHeader>

          <FormField
            control={form.control}
            name="expireAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline">
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Expire at</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  A date when the travel itinerary link will expire.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={createTravelShare.status === "executing"}
              className="w-full"
            >
              {createTravelShare.status === "executing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Share"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
