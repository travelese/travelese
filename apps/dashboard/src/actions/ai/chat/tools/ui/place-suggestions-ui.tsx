"use client";

import { BotCard, BotMessage } from "@/components/chat/messages";

type Props = {
  content: string;
};

export function PlaceSuggestionsUI({ content }: Props) {
  if (!content) {
    return (
      <BotCard>
        No place suggestions found. Please try a different place.
      </BotCard>
    );
  }

  return <BotMessage content={content} />;
}
