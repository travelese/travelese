"use client";

import { changeTravelRoomsAction } from "@/actions/change-travel-rooms-action";
import { ItemCounter, type ItemType } from "@/components/item-counter";
import { useI18n } from "@/locales/client";
import { Icons } from "@travelese/ui/icons";
import { useOptimisticAction } from "next-safe-action/hooks";

type Props = {
  value: Record<string, number>;
  disabled?: boolean;
  onChange: (value: Record<string, number>) => void;
};

export function TravelRooms({ value, disabled, onChange }: Props) {
  const t = useI18n();

  const roomTypes: ItemType[] = [
    {
      id: "room",
      label: t("travel_rooms.room"),
      subLabel: "Room",
      icon: <Icons.Room className="size-4" />,
    },
  ];

  const { execute, optimisticState } = useOptimisticAction(
    changeTravelRoomsAction,
    {
      currentState: value,
      updateFn: (_, newState) => newState,
    },
  );

  const handleRoomChange = (newCounts: Record<string, number>) => {
    execute(newCounts);
    onChange(newCounts);
  };

  return (
    <ItemCounter
      items={roomTypes}
      value={optimisticState || value}
      onChange={handleRoomChange}
      disabled={disabled}
    />
  );
}
