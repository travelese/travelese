"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Calendar as CalendarIcon,
  MailIcon,
  PhoneIcon,
  UserCircleIcon,
} from "lucide-react";

import { toast } from "sonner";
import type { Offer } from "@duffel/api/types";
import Loading from "@/app/loading";

interface BookFormProps {
  selectedOffer: Offer;
}

const FormSchema = z.object({
  passengers: z.array(
    z.object({
      id: z.string(),
      title: z.enum(["mr", "ms", "mrs", "miss", "dr"]),
      given_name: z.string().min(1, "Given name is required"),
      family_name: z.string().min(1, "Family name is required"),
      gender: z.enum(["m", "f"]),
      born_on: z.string().min(1, "Birth date is required"),
      phone_number: z.string().min(1, "Phone number is required"),
      email: z.string().email("Invalid email address"),
      type: z.string(),
    }),
  ),
  payments: z.array(
    z.object({
      amount: z.number(),
      currency: z.string().length(3, "Currency must be 3 characters"),
      type: z.enum(["arc_basp_cash", "balance", "credit"]),
    }),
  ),
  selected_offers: z.array(z.string().min(1, "Offer ID is required")),
});

export default function BookForm({ selectedOffer }: BookFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      passengers: [
        {
          id: selectedOffer ? selectedOffer.passengers[0].id : "",
          title: "mr",
          given_name: "",
          family_name: "",
          gender: "m",
          born_on: "",
          phone_number: "",
          email: "",
          type: selectedOffer ? selectedOffer.passengers[0].type : "",
        },
      ],
      payments: [
        {
          amount: selectedOffer ? Number(selectedOffer.total_amount) : 0,
          currency: selectedOffer ? selectedOffer.total_currency : "",
          type: "balance",
        },
      ],
      selected_offers: [selectedOffer ? selectedOffer.id : ""],
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (data) => {
    const formData = {
      selected_offers: [selectedOffer.id],
      passengers: [
        {
          ...data.passengers[0],
          id: selectedOffer.passengers[0].id,
          type: selectedOffer.passengers[0].type,
        },
      ],
      payments: [
        {
          type: "balance",
          amount: selectedOffer.total_amount,
          currency: selectedOffer.total_currency,
        },
      ],
    };

    const bookingToast = toast.loading(
      <div className="flex items-center gap-2">
        <Loading />
        <span>Booking order...</span>
      </div>,
    );

    try {
      // Book the flight
      const bookingResponse = await fetch("/api/travel/fly/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.error || "Failed to create the booking.");
      }

      const order = await bookingResponse.json();

      if (!order.booking_reference) {
        throw new Error("Booking failed: No booking reference received");
      }

      toast.success("Booking successful", {
        id: bookingToast,
        description: `Booking reference: ${order.booking_reference}`,
      });

      // Save the order
      const syncToast = toast.loading(
        <div className="flex items-center gap-2">
          <Loading />
          <span>Syncying order...</span>
        </div>,
      );

      const saveResponse = await fetch("/api/travel/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || "Failed to save the order.");
      }

      toast.success("Order synced successfully", { id: syncToast });

      // Send email confirmation
      const emailToast = toast.loading(
        <div className="flex items-center gap-2">
          <Loading />
          <span>Emailing order...</span>
        </div>,
      );

      const emailResponse = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: order.passengers[0].email,
          ...order, // Include all order details for the email template
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(
          errorData.error || "Failed to send confirmation email.",
        );
      }

      toast.success("Confirmation email sent", {
        id: emailToast,
        description: `Email sent to ${order.passengers[0].email}`,
      });
    } catch (error) {
      toast.error("Error", {
        description: `Failed to complete the booking process: ${error instanceof Error ? error.message : error}`,
      });

      console.error("Booking process error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traveller Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="passengers.0.title"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mr">Mr</SelectItem>
                          <SelectItem value="ms">Ms</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="passengers.0.given_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative flex items-center zoom-in-0">
                          <UserCircleIcon className="absolute left-3 h-4 w-4" />
                          <Input
                            className="pl-10"
                            placeholder="First name"
                            {...field}
                            value={field.value}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="passengers.0.family_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative flex items-center zoom-in-0">
                          <UserCircleIcon className="absolute left-3 h-4 w-4" />
                          <Input
                            className="pl-10"
                            placeholder="Last name"
                            {...field}
                            value={field.value}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passengers.0.gender"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="m">Male</SelectItem>
                        <SelectItem value="f">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passengers.0.born_on"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative flex items-center zoom-in-0">
                        <CalendarIcon className="absolute left-3 h-4 w-4" />
                        <Input
                          className="pl-10"
                          placeholder="Birth date"
                          {...field}
                          value={field.value}
                          type="date"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passengers.0.phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative flex items-center zoom-in-0">
                        <PhoneIcon className="absolute left-3 h-4 w-4" />
                        <Input
                          className="pl-10"
                          placeholder="Phone number"
                          {...field}
                          value={field.value}
                          type="tel"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passengers.0.email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative flex items-center zoom-in-0">
                        <MailIcon className="absolute left-3 h-4 w-4" />
                        <Input
                          className="pl-10"
                          placeholder="Email"
                          {...field}
                          value={field.value}
                          type="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1 w-full">
              <Button type="submit" className="w-full h-full">
                Book
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
