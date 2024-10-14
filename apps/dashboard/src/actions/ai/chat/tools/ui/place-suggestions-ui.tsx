import { BotCard } from "@/components/chat/messages";
import type { Places } from "@duffel/api/types";

type Props = {
  suggestions: Places[];
  query: string;
};

export function PlaceSuggestionsUI({ suggestions, query }: Props) {
  if (!suggestions.length) {
    return (
      <BotCard>
        No place suggestions found for "{query}". Please try a different search
        term.
      </BotCard>
    );
  }

  return (
    <BotCard className="font-sans space-y-4">
      <p className="font-mono">
        Here are some place suggestions for "{query}":
      </p>
      <ul className="space-y-2">
        {suggestions.map((place) => (
          <li key={place.id} className="text-sm">
            {place.name} ({place.iata_code}) - {place.type}
            {place.city_name && ` in ${place.city_name}`}
          </li>
        ))}
      </ul>
    </BotCard>
  );
}
