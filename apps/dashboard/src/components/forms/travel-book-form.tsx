"use client";

import type { bookTravelSchema } from "@/actions/schema";
import { Button } from "@travelese/ui/button";
import { Calendar } from "@travelese/ui/calendar";
import { cn } from "@travelese/ui/cn";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@travelese/ui/form";
import { Input } from "@travelese/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@travelese/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@travelese/ui/select";
import { SubmitButton } from "@travelese/ui/submit-button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type UseFormReturn, useForm } from "react-hook-form";
import type { z } from "zod";

interface Props {
  form: UseFormReturn<z.infer<typeof bookTravelSchema>>;
  onSubmit: (data: z.infer<typeof bookTravelSchema>) => void;
  isSaving: boolean;
  bookingType: "flights" | "stays";
  defaultValues?: Partial<z.infer<typeof bookTravelSchema>>;
}

export function BookTravelForm({
  form,
  onSubmit,
  isSaving,
  bookingType,
  defaultValues,
}: Props) {
  const isFlights = bookingType === "flights";

  const addPassenger = () => {
    const currentPassengers = form.getValues("passengers") || [];
    if (currentPassengers.length < 9) {
      form.setValue("passengers", [
        ...currentPassengers,
        {
          type: "adult",
          title: "Mr",
          given_name: "",
          family_name: "",
          email: "",
          born_on: "",
          phone_number: "",
        },
      ]);
    }
  };

  const removePassenger = (index: number) => {
    const currentPassengers = form.getValues("passengers") || [];
    if (currentPassengers.length > 1) {
      form.setValue(
        "passengers",
        currentPassengers.filter((_, i) => i !== index),
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isFlights ? (
          // Flights booking form
          <>
            {form.watch("passengers")?.map((passenger, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Passenger {index + 1}</h3>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePassenger(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name={`passengers.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passenger Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="infant_without_seat">
                            Infant (No Seat)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`passengers.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mr">Mr</SelectItem>
                          <SelectItem value="ms">Ms</SelectItem>
                          <SelectItem value="mrs">Mrs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`passengers.${index}.given_name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`passengers.${index}.family_name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`passengers.${index}.born_on`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : "",
                              )
                            }
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`passengers.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`passengers.${index}.phone_number`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormDescription>
                        Include country code (e.g., +1 for US)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={addPassenger}
              disabled={form.watch("passengers")?.length >= 9}
            >
              Add Passenger
            </Button>
          </>
        ) : (
          // Stays booking form
          <>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="guest_info.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guest_info.phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormDescription>
                      Include country code (e.g., +1 for US)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("guest_info.guests")?.map((guest, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-medium">Guest {index + 1}</h3>

                  <FormField
                    control={form.control}
                    name={`guest_info.guests.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="adult">Adult</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`guest_info.guests.${index}.given_name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`guest_info.guests.${index}.family_name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="fixed bottom-8 w-full sm:max-w-[455px] right-8">
          <SubmitButton className="w-full" isSubmitting={isSaving}>
            Complete Booking
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
}
