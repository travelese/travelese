"use client";

import { Avatar, AvatarImage } from "@travelese/ui/avatar";

type Props = {
  role: "assistant" | "user";
};

export function ChatAvatar({ role }: Props) {
  switch (role) {
    case "user": {
      return (
        <Avatar className="size-6">
          <AvatarImage src="https://pbs.twimg.com/profile_images/1831477610414518272/s_7NZWub_400x400.jpg" />
        </Avatar>
      );
    }

    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          fill="none"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="m.8 16.343 9.98-5.786H.8V6.4h22.4v4.157H13.155L23.2 16.343v5.02l-11.104-6.796L.8 21.6v-5.257Z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}
