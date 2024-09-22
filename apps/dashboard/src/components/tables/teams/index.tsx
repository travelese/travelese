import { getUser } from "@travelese/supabase/cached-queries";
import {
  getTeamsByUserIdQuery,
  getUserInvitesQuery,
} from "@travelese/supabase/queries";
import { createClient } from "@travelese/supabase/server";
import { DataTable } from "./table";

export async function TeamsTable() {
  const supabase = createClient();
  const user = await getUser();

  const [teams, invites] = await Promise.all([
    getTeamsByUserIdQuery(supabase, user.data?.id),
    getUserInvitesQuery(supabase, user.data?.email),
  ]);

  return (
    <DataTable
      data={[
        ...teams?.data,
        ...invites?.data?.map((invite) => ({ ...invite, isInvite: true })),
      ]}
    />
  );
}
