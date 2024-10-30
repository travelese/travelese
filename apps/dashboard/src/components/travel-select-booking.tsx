"use client";

import { createBookingAction } from "@/actions/booking/create-booking-action";
import { createClient } from "@travelese/supabase/client";
import { getTravelBookingsQuery } from "@travelese/supabase/queries";
import { Combobox } from "@travelese/ui/combobox";
import { useToast } from "@travelese/ui/use-toast";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";

type Props = {
  teamId: string;
  selectedId?: string;
  onSelect: (selected: Option) => void;
  onCreate: (booking: { id: string; name: string }) => void;
};

type Option = {
  id: string;
  name: string;
};

export function TravelSelectBooking({
  teamId,
  selectedId,
  onSelect,
  onCreate,
}: Props) {
  const { toast } = useToast();
  const supabase = createClient();
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [value, setValue] = useState<Option | undefined>();

  useEffect(() => {
    const foundBooking = data?.find((booking) => booking?.id === selectedId);

    if (foundBooking) {
      setValue({ id: foundBooking.id, name: foundBooking.name });
    }
  }, [selectedId]);

  const handleSelect = (selected: Option) => {
    setValue(selected);
    onSelect(selected);
  };

  const createBooking = useAction(createBookingAction, {
    onSuccess: ({ data: booking }) => {
      onCreate?.(booking);
      handleSelect(booking);
    },
    onError: () => {
      toast({
        duration: 3500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  const fetchBookings = async () => {
    setLoading(true);

    const { data: bookingsData } = await getTravelBookingsQuery(supabase, {
      teamId,
      sort: ["status", "asc"],
    });

    setLoading(false);
    setData(bookingsData);

    const foundBooking = bookingsData.find(
      (booking) => projet?.id === selectedId,
    );

    if (foundBooking) {
      setValue({ id: foundBooking.id, name: foundBooking.name });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <Combobox
      key={value?.id}
      placeholder="Search or create booking"
      classNameList="-top-[4px] border-t-0 rounded-none rounded-b-md"
      className="w-full bg-transparent px-12 border py-3"
      onSelect={handleSelect}
      options={data}
      value={value}
      isLoading={isLoading}
      onCreate={(name) => createBooking.execute({ name })}
    />
  );
}
