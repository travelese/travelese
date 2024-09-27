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
    <BotCard>
      <h3 className="text-sm font-semibold mb-2">Suggestions for "{query}":</h3>
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
