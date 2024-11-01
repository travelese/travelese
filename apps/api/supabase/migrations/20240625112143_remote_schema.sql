-- Drop Policy "New Policy Name"
drop policy "New Policy Name" on "public"."users_on_team";

-- Drop View "public"."current_user_teams"
drop view if exists "public"."current_user_teams";

-- Create Policy "Select for current user teams"
create policy "Select for current user teams"
on "public"."users_on_team"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM private.current_user_teams cut
  WHERE ((cut.user_id = ( SELECT auth.uid() AS uid)) AND (cut.team_id = users_on_team.team_id)))));


