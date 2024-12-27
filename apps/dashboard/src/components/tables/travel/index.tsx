import { DataTable } from "@/components/tables/travel/data-table";
import { getTravelBookings } from "@travelese/supabase/cached-queries";
import { EmptyState, NoResults } from "./empty-states";

const pageSize = 20;

type Props = {
  statuses?: string[];
  sort?: string;
  q?: string;
  start?: string;
  end?: string;
  userId: string;
  customerIds?: string[];
};

export async function TravelTable({
  statuses,
  sort,
  q,
  start,
  end,
  userId,
  customerIds,
}: Props) {
  const hasFilters = Boolean(statuses || q);

  const { data, meta } = await getTravelBookings({
    from: 0,
    to: pageSize,
    sort,
    start,
    end,
    filter: { statuses, customers: customerIds },
    search: {
      query: q,
      fuzzy: true,
    },
  });

  async function loadMore({ from, to }) {
    "use server";

    return getTravelBookings({
      to,
      from: from + 1,
      sort,
      filter: {
        statuses,
        customers: customerIds,
      },
      search: {
        query: q,
        fuzzy: true,
      },
    });
  }

  if (!data?.length && !hasFilters) {
    return <EmptyState />;
  }

  if (!data?.length && hasFilters) {
    return <NoResults />;
  }

  return (
    <DataTable
      data={data}
      pageSize={pageSize}
      loadMore={loadMore}
      meta={meta}
      userId={userId}
    />
  );
}
