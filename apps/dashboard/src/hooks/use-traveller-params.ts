import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";

export function useTravellerParams(options?: { shallow: boolean }) {
  const [params, setParams] = useQueryStates(
    {
      travellerId: parseAsString,
      createTraveller: parseAsBoolean,
      sort: parseAsArrayOf(parseAsString),
      name: parseAsString,
      q: parseAsString,
    },
    options,
  );

  return {
    ...params,
    setParams,
  };
}
