-- Current User Teams View:
create or replace view "private"."current_user_teams" as  SELECT ( SELECT auth.uid() AS uid) AS user_id,
    t.team_id
   FROM users_on_team t
  WHERE (t.user_id = ( SELECT auth.uid() AS uid));

-- Drop Policy "Enable read access for all users"
drop policy "Enable read access for all users" on "public"."users_on_team";

-- Set check_function_bodies to off
set check_function_bodies = off;

-- Current User Teams View:
create or replace view "public"."current_user_teams" as  SELECT ( SELECT auth.uid() AS uid) AS user_id,
    t.team_id
   FROM users_on_team t
  WHERE (t.user_id = ( SELECT auth.uid() AS uid));

-- Get Current User Team ID Function:
CREATE OR REPLACE FUNCTION public.get_current_user_team_id()
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN (SELECT team_id FROM users WHERE id = (SELECT auth.uid()));
END;
$function$
;

-- Create Policy "New Policy Name"
create policy "New Policy Name"
on "public"."users_on_team"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM private.current_user_teams cut
  WHERE ((cut.user_id = ( SELECT auth.uid() AS uid)) AND (cut.team_id = users_on_team.team_id)))));
