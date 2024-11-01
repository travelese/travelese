-- Tracker Type Definitions
CREATE TYPE "public"."trackerStatus" AS ENUM (
    'in_progress',
    'completed'
);

ALTER TYPE "public"."trackerStatus" OWNER TO "postgres";

-- Travel Type Definitions
CREATE TYPE "public"."travelStatus" AS ENUM (
    'in_progress',
    'completed'
);

ALTER TYPE "public"."travelStatus" OWNER TO "postgres";

-- Tracker Entries Table
CREATE TABLE IF NOT EXISTS "public"."tracker_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "duration" bigint,
    "project_id" "uuid",
    "start" timestamp without time zone,
    "stop" timestamp without time zone,
    "assigned_id" "uuid",
    "team_id" "uuid",
    "description" "text",
    "rate" numeric,
    "currency" "text",
    "billed" boolean DEFAULT false,
    "date" "date" DEFAULT "now"()
);

ALTER TABLE "public"."tracker_entries" OWNER TO "postgres";

-- Tracker Entries Duration Comment:
COMMENT ON COLUMN "public"."tracker_entries"."duration" IS 'Time entry duration. For running entries should be negative, preferable -1';  
-- Tracker Entries Start Comment:
COMMENT ON COLUMN "public"."tracker_entries"."start" IS 'Start time in UTC';

-- Tracker Entries Stop Comment:
COMMENT ON COLUMN "public"."tracker_entries"."stop" IS 'Stop time in UTC, can be null if it''s still running or created with duration';

-- Tracker Entries Description Comment:
COMMENT ON COLUMN "public"."tracker_entries"."description" IS 'Time Entry description, null if not provided at creation/update';

-- Travel Entries Table
CREATE TABLE IF NOT EXISTS "public"."travel_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "duration" bigint,
    "booking_id" "uuid",
    "start" timestamp without time zone,
    "stop" timestamp without time zone,
    "assigned_id" "uuid",
    "team_id" "uuid",
    "description" "text",
    "rate" numeric,
    "currency" "text",
    "billed" boolean DEFAULT false,
    "date" "date" DEFAULT "now"()
);

ALTER TABLE "public"."travel_entries" OWNER TO "postgres";

-- Travel Entries Duration Comment:
COMMENT ON COLUMN "public"."travel_entries"."duration" IS 'Time entry duration. For running entries should be negative, preferable -1';

-- Travel Entries Start Comment:
COMMENT ON COLUMN "public"."travel_entries"."start" IS 'Start time in UTC';

-- Travel Entries Stop Comment:
COMMENT ON COLUMN "public"."travel_entries"."stop" IS 'Stop time in UTC, can be null if it''s still running or created with duration';

-- Travel Entries Description Comment:
COMMENT ON COLUMN "public"."travel_entries"."description" IS 'Time Entry description, null if not provided at creation/update';

-- Project Members Function (Entries):
CREATE OR REPLACE FUNCTION "public"."project_members"("public"."tracker_entries") RETURNS TABLE("id" "uuid", "avatar_url" "text", "full_name" "text")
    LANGUAGE "sql"
    AS $_$
  select distinct on (users.id) users.id, users.avatar_url, users.full_name
  from tracker_entries
  join users on tracker_entries.user_id = users.id
  where tracker_entries.project_id = $1.project_id;
$_$;

ALTER FUNCTION "public"."project_members"("public"."tracker_entries") OWNER TO "postgres";

-- Booking Members Function (Entries):
CREATE OR REPLACE FUNCTION "public"."booking_members"("public"."travel_entries") RETURNS TABLE("id" "uuid", "avatar_url" "text", "full_name" "text")
    LANGUAGE "sql"
    AS $_$
  select distinct on (users.id) users.id, users.avatar_url, users.full_name
  from travel_entries
  join users on travel_entries.user_id = users.id
  where travel_entries.booking_id = $1.booking_id;
$_$;

ALTER FUNCTION "public"."booking_members"("public"."travel_entries") OWNER TO "postgres";

-- Tracker Projects Table
CREATE TABLE IF NOT EXISTS "public"."tracker_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "team_id" "uuid",
    "rate" numeric,
    "currency" "text",
    "status" "public"."trackerStatus" DEFAULT 'in_progress'::"public"."trackerStatus" NOT NULL,
    "description" "text",
    "name" "text" NOT NULL,
    "billable" boolean DEFAULT false,
    "estimate" bigint
);

ALTER TABLE "public"."tracker_projects" OWNER TO "postgres";

-- Tracker Projects Rate Comment:
COMMENT ON COLUMN "public"."tracker_projects"."rate" IS 'Custom rate for project';

-- Travel Bookings Table:
CREATE TABLE IF NOT EXISTS "public"."travel_bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "team_id" "uuid",
    "rate" numeric,
    "currency" "text",
    "status" "public"."travelStatus" DEFAULT 'in_progress'::"public"."travelStatus" NOT NULL,
    "description" "text",
    "name" "text" NOT NULL,
    "billable" boolean DEFAULT false,
    "estimate" bigint
);

ALTER TABLE "public"."travel_bookings" OWNER TO "postgres";

-- Travel Bookings Rate Comment:
COMMENT ON COLUMN "public"."travel_bookings"."rate" IS 'Custom rate for booking';

-- Project Members Function (Projects):
CREATE OR REPLACE FUNCTION "public"."project_members"("public"."tracker_projects") RETURNS TABLE("id" "uuid", "avatar_url" "text", "full_name" "text")
    LANGUAGE "sql"
    AS $$
  select distinct on (users.id) users.id, users.avatar_url, users.full_name
  from tracker_projects
  left join tracker_entries on tracker_projects.id = tracker_entries.project_id
  left join users on tracker_entries.user_id = users.id;
$$;

ALTER FUNCTION "public"."project_members"("public"."tracker_projects") OWNER TO "postgres";

-- Booking Members Function (Bookings):
CREATE OR REPLACE FUNCTION "public"."booking_members"("public"."travel_bookings") RETURNS TABLE("id" "uuid", "avatar_url" "text", "full_name" "text")
    LANGUAGE "sql"
    AS $$
  select distinct on (users.id) users.id, users.avatar_url, users.full_name
  from travel_bookings
  left join travel_entries on travel_bookings.id = travel_entries.booking_id
  left join users on travel_entries.user_id = users.id;
$$;

ALTER FUNCTION "public"."booking_members"("public"."travel_bookings") OWNER TO "postgres";

-- Total Duration Function (Projects):
CREATE OR REPLACE FUNCTION "public"."total_duration"("public"."tracker_projects") RETURNS integer
    LANGUAGE "sql"
    AS $_$
  select sum(tracker_entries.duration) as total_duration
  from
    tracker_projects
    join tracker_entries on tracker_projects.id = tracker_entries.project_id
  where
    tracker_projects.id = $1.id
  group by
    tracker_projects.id;
$_$;

ALTER FUNCTION "public"."total_duration"("public"."tracker_projects") OWNER TO "postgres";

-- Total Duration Function (Bookings):
CREATE OR REPLACE FUNCTION "public"."total_duration"("public"."travel_bookings") RETURNS integer
    LANGUAGE "sql"
    AS $_$
  select sum(travel_entries.duration) as total_duration
  from
    travel_bookings
    join travel_entries on travel_bookings.id = travel_entries.booking_id
  where
    travel_bookings.id = $1.id
  group by
    travel_bookings.id;
$_$;

ALTER FUNCTION "public"."total_duration"("public"."travel_bookings") OWNER TO "postgres";

-- Tracker Reports Table
CREATE TABLE IF NOT EXISTS "public"."tracker_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "link_id" "text",
    "short_link" "text",
    "team_id" "uuid" DEFAULT "gen_random_uuid"(),
    "project_id" "uuid" DEFAULT "gen_random_uuid"(),
    "created_by" "uuid"
);

ALTER TABLE "public"."tracker_reports" OWNER TO "postgres";

-- Travel Reports Table
CREATE TABLE IF NOT EXISTS "public"."travel_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "link_id" "text",
    "short_link" "text",
    "team_id" "uuid" DEFAULT "gen_random_uuid"(),
    "booking_id" "uuid" DEFAULT "gen_random_uuid"(),
    "created_by" "uuid"
);

ALTER TABLE "public"."travel_reports" OWNER TO "postgres";

-- Tracker Reports Primary Key:
ALTER TABLE ONLY "public"."tracker_reports"
    ADD CONSTRAINT "project_reports_pkey" PRIMARY KEY ("id");

-- Travel Reports Primary Key:
ALTER TABLE ONLY "public"."travel_reports"
    ADD CONSTRAINT "booking_reports_pkey" PRIMARY KEY ("id");

-- Tracker Projects Primary Key:
ALTER TABLE ONLY "public"."tracker_projects"
    ADD CONSTRAINT "tracker_projects_pkey" PRIMARY KEY ("id");

-- Tracker Entries Primary Key:
ALTER TABLE ONLY "public"."tracker_entries"
    ADD CONSTRAINT "tracker_records_pkey" PRIMARY KEY ("id");

-- Travel Bookings Primary Key:
ALTER TABLE ONLY "public"."travel_bookings"
    ADD CONSTRAINT "travel_bookings_pkey" PRIMARY KEY ("id");

-- Travel Entries Primary Key:
ALTER TABLE ONLY "public"."travel_entries"
    ADD CONSTRAINT "travel_records_pkey" PRIMARY KEY ("id");

-- Tracker Reports Foreign Keys:
ALTER TABLE ONLY "public"."tracker_reports"
    ADD CONSTRAINT "public_tracker_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tracker_reports"
    ADD CONSTRAINT "public_tracker_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."tracker_projects"("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- Travel Reports Foreign Keys:
ALTER TABLE ONLY "public"."travel_reports"
    ADD CONSTRAINT "public_travel_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."travel_reports"
    ADD CONSTRAINT "public_travel_reports_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."travel_bookings"("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- Tracker Entries Foreign Keys:
ALTER TABLE ONLY "public"."tracker_entries"
    ADD CONSTRAINT "tracker_entries_assigned_id_fkey" FOREIGN KEY ("assigned_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."tracker_entries"
    ADD CONSTRAINT "tracker_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."tracker_projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tracker_entries"
    ADD CONSTRAINT "tracker_entries_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;

-- Tracker Projects Foreign Keys:
ALTER TABLE ONLY "public"."tracker_projects"
    ADD CONSTRAINT "tracker_projects_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tracker_reports"
    ADD CONSTRAINT "tracker_reports_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- Travel Entries Foreign Keys:
ALTER TABLE ONLY "public"."travel_entries"
    ADD CONSTRAINT "travel_entries_assigned_id_fkey" FOREIGN KEY ("assigned_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."travel_entries"
    ADD CONSTRAINT "travel_entries_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."travel_bookings"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."travel_entries"
    ADD CONSTRAINT "travel_entries_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;

-- Travel Bookings Foreign Keys:
ALTER TABLE ONLY "public"."travel_bookings"
    ADD CONSTRAINT "travel_bookings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."travel_reports"
    ADD CONSTRAINT "travel_reports_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- Tracker Entry Policies:
CREATE POLICY "Entries can be created by a member of the team" ON "public"."tracker_entries" FOR INSERT TO "authenticated" WITH CHECK (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Entries can be deleted by a member of the team" ON "public"."tracker_entries" FOR DELETE TO "authenticated" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Entries can be selected by a member of the team" ON "public"."tracker_entries" FOR SELECT TO "authenticated" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Entries can be updated by a member of the team" ON "public"."tracker_entries" FOR UPDATE TO "authenticated" WITH CHECK (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

-- Travel Entry Policies:
CREATE POLICY "Entries can be created by a member of the team" ON "public"."travel_entries" FOR INSERT TO "authenticated" WITH CHECK (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Entries can be deleted by a member of the team" ON "public"."travel_entries" FOR DELETE TO "authenticated" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Entries can be selected by a member of the team" ON "public"."travel_entries" FOR SELECT TO "authenticated" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Entries can be updated by a member of the team" ON "public"."travel_entries" FOR UPDATE TO "authenticated" WITH CHECK (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

-- Tracker Projects Policies:
CREATE POLICY "Projects can be created by a member of the team" ON "public"."tracker_projects" FOR INSERT TO "authenticated" WITH CHECK (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Projects can be deleted by a member of the team" ON "public"."tracker_projects" FOR DELETE TO "authenticated" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Projects can be selected by a member of the team" ON "public"."tracker_projects" FOR SELECT TO "authenticated" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Projects can be updated by a member of the team" ON "public"."tracker_projects" FOR UPDATE TO "authenticated" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

-- Travel Booking Policies:
CREATE POLICY "Bookings can be created by a member of the team" ON "public"."travel_bookings" FOR INSERT TO "authenticated" WITH CHECK (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Bookings can be deleted by a member of the team" ON "public"."travel_bookings" FOR DELETE TO "authenticated" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Bookings can be selected by a member of the team" ON "public"."travel_bookings" FOR SELECT TO "authenticated" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Bookings can be updated by a member of the team" ON "public"."travel_bookings" FOR UPDATE TO "authenticated" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

-- Tracker Report Policies:
CREATE POLICY "Reports can be handled by a member of the team" ON "public"."tracker_reports" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

-- Travel Report Policies:
CREATE POLICY "Reports can be handled by a member of the team" ON "public"."travel_reports" USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

-- Tracker Entries RLS Enablement:
ALTER TABLE "public"."tracker_entries" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tracker_projects" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tracker_reports" ENABLE ROW LEVEL SECURITY;

-- Travel Entries RLS Enablement:
ALTER TABLE "public"."travel_entries" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."travel_bookings" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."travel_reports" ENABLE ROW LEVEL SECURITY;

-- Tracker Entries Table Grants:
GRANT ALL ON TABLE "public"."tracker_entries" TO "anon";
GRANT ALL ON TABLE "public"."tracker_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."tracker_entries" TO "service_role";

-- Tracker Entries Function Grants:
GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_entries") TO "anon";
GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_entries") TO "authenticated";
GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_entries") TO "service_role";

-- Tracker Projects Table Grants:
GRANT ALL ON TABLE "public"."tracker_projects" TO "anon";
GRANT ALL ON TABLE "public"."tracker_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."tracker_projects" TO "service_role";

-- Tracker Projects Function Grants:
GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_projects") TO "anon";
GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_projects") TO "authenticated";
GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_projects") TO "service_role";

-- Travel Entries Table Grants:
GRANT ALL ON TABLE "public"."travel_entries" TO "anon";
GRANT ALL ON TABLE "public"."travel_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."travel_entries" TO "service_role";

-- Travel Entries Function Grants:
GRANT ALL ON FUNCTION "public"."booking_members"("public"."travel_entries") TO "anon";
GRANT ALL ON FUNCTION "public"."booking_members"("public"."travel_entries") TO "authenticated";
GRANT ALL ON FUNCTION "public"."booking_members"("public"."travel_entries") TO "service_role";

-- Travel Bookings Table Grants:
GRANT ALL ON TABLE "public"."travel_bookings" TO "anon";
GRANT ALL ON TABLE "public"."travel_bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."travel_bookings" TO "service_role";

-- Travel Bookings Function Grants:
GRANT ALL ON FUNCTION "public"."booking_members"("public"."travel_bookings") TO "anon";
GRANT ALL ON FUNCTION "public"."booking_members"("public"."travel_bookings") TO "authenticated";
GRANT ALL ON FUNCTION "public"."booking_members"("public"."travel_bookings") TO "service_role";

-- Tracker Projects Function Grants:
GRANT ALL ON FUNCTION "public"."total_duration"("public"."tracker_projects") TO "anon";
GRANT ALL ON FUNCTION "public"."total_duration"("public"."tracker_projects") TO "authenticated";
GRANT ALL ON FUNCTION "public"."total_duration"("public"."tracker_projects") TO "service_role";

-- Travel Booking Function Grants:
GRANT ALL ON FUNCTION "public"."total_duration"("public"."travel_bookings") TO "anon";
GRANT ALL ON FUNCTION "public"."total_duration"("public"."travel_bookings") TO "authenticated";
GRANT ALL ON FUNCTION "public"."total_duration"("public"."travel_bookings") TO "service_role";

-- Tracker Reports Table Grants:
GRANT ALL ON TABLE "public"."tracker_reports" TO "anon";
GRANT ALL ON TABLE "public"."tracker_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."tracker_reports" TO "service_role";

-- Travel Reports Table Grants:
GRANT ALL ON TABLE "public"."travel_reports" TO "anon";
GRANT ALL ON TABLE "public"."travel_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."travel_reports" TO "service_role";

-- Tracker Entries Index:
CREATE INDEX tracker_entries_team_id_idx ON public.tracker_entries USING btree (team_id);

-- Tracker Projects Index:
CREATE INDEX tracker_projects_team_id_idx ON public.tracker_projects USING btree (team_id);

-- Tracker Reports Index:
CREATE INDEX tracker_reports_team_id_idx ON public.tracker_reports USING btree (team_id);

-- Travel Entries Index:
CREATE INDEX travel_entries_team_id_idx ON public.travel_entries USING btree (team_id);

-- Travel Bookings Index:
CREATE INDEX travel_bookings_team_id_idx ON public.travel_bookings USING btree (team_id);

-- Travel Reports Index:
CREATE INDEX travel_reports_team_id_idx ON public.travel_reports USING btree (team_id);

-- Tracker Entries Update Policy:
drop policy "Entries can be updated by a member of the team" on "public"."tracker_entries";

-- Travel Entries Update Policy:
drop policy "Entries can be updated by a member of the team" on "public"."travel_entries";

-- Tracker Timestamp Column Updates:
alter table "public"."tracker_entries" alter column "start" set data type timestamp with time zone using "start"::timestamp with time zone;

alter table "public"."tracker_entries" alter column "stop" set data type timestamp with time zone using "stop"::timestamp with time zone;

-- Travel Timestamp Column Updates:
alter table "public"."travel_entries" alter column "start" set data type timestamp with time zone using "start"::timestamp with time zone;

alter table "public"."travel_entries" alter column "stop" set data type timestamp with time zone using "stop"::timestamp with time zone;

-- Tracker Get Assigned Users Function:
CREATE OR REPLACE FUNCTION public.get_assigned_users_for_project(tracker_projects)
 RETURNS json
 LANGUAGE sql
AS $function$
  SELECT COALESCE(
    (SELECT json_agg(
      json_build_object(
        'user_id', u.id,
        'full_name', u.full_name,
        'avatar_url', u.avatar_url
      )
    )
    FROM (
      SELECT DISTINCT u.id, u.full_name, u.avatar_url
      FROM public.users u
      JOIN public.tracker_entries te ON u.id = te.assigned_id
      WHERE te.project_id = $1.id
    ) u
  ), '[]'::json);
$function$
;

-- Tracker Get Project Total Amount Function:
CREATE OR REPLACE FUNCTION public.get_project_total_amount(tracker_projects)
 RETURNS numeric
 LANGUAGE sql
AS $function$
  SELECT COALESCE(
    (SELECT 
      CASE 
        WHEN $1.rate IS NOT NULL THEN 
          ROUND(SUM(te.duration) * $1.rate / 3600, 2)
        ELSE 
          0
      END
    FROM public.tracker_entries te
    WHERE te.project_id = $1.id
    ), 0
  );
$function$
;

-- Travel Get Assigned Users Function:
CREATE OR REPLACE FUNCTION public.get_assigned_users_for_booking(travel_bookings)
 RETURNS json
 LANGUAGE sql
AS $function$
  SELECT COALESCE(
    (SELECT json_agg(
      json_build_object(
        'user_id', u.id,
        'full_name', u.full_name,
        'avatar_url', u.avatar_url
      )
    )
    FROM (
      SELECT DISTINCT u.id, u.full_name, u.avatar_url
      FROM public.users u
      JOIN public.travel_entries te ON u.id = te.assigned_id
      WHERE te.booking_id = $1.id
    ) u
  ), '[]'::json);
$function$
;

-- Travel Get Booking Total Amount Function:
CREATE OR REPLACE FUNCTION public.get_booking_total_amount(travel_bookings)
 RETURNS numeric
 LANGUAGE sql
AS $function$
  SELECT COALESCE(
    (SELECT 
      CASE 
        WHEN $1.rate IS NOT NULL THEN 
          ROUND(SUM(te.duration) * $1.rate / 3600, 2)
        ELSE 
          0
      END
    FROM public.travel_entries te
    WHERE te.booking_id = $1.id
    ), 0
  );
$function$
;

-- Tracker Entries Update Policy:
create policy "Entries can be updated by a member of the team"
on "public"."tracker_entries"
as permissive
for update
to authenticated
using ((team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user)))
with check ((team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user)));

-- Travel Entries Update Policy:
create policy "Entries can be updated by a member of the team"
on "public"."travel_entries"
as permissive
for update
to authenticated
using ((team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user)))
with check ((team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user)));
