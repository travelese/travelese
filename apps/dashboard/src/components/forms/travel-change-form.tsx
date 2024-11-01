"use client";

import type { changeTravelSchema } from "@/actions/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@travelese/ui/form";
import { Input } from "@travelese/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@travelese/ui/select";
import { SubmitButton } from "@travelese/ui/submit-button";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

interface Props {
  form: UseFormReturn<z.infer<typeof changeTravelSchema>>;
  onSubmit: (data: z.infer<typeof changeTravelSchema>) => void;
  isSaving: boolean;
}

export function ChangeTravelForm({ form, onSubmit, isSaving }: Props) {
  const isFlights = form.watch("change_type") === "flights";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="change_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Change Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="flights">Change Flight</SelectItem>
                  <SelectItem value="stays">Cancel Stay</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isFlights ? (
          <>
            <FormField
              control={form.control}
              name="order_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("slices")?.map((_, index) => (
              <div key={index} className="space-y-4">
                <FormField
                  control={form.control}
                  name={`slices.${index}.origin`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`slices.${index}.destination`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`slices.${index}.departure_date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`slices.${index}.cabin_class`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cabin Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cabin class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="economy">Economy</SelectItem>
                          <SelectItem value="premium_economy">
                            Premium Economy
                          </SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="first">First</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="booking_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cancellation_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Reason</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="fixed bottom-8 w-full sm:max-w-[455px] right-8">
          <SubmitButton className="w-full" isSubmitting={isSaving}>
            {isFlights ? "Change Flight" : "Cancel Stay"}
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
}
