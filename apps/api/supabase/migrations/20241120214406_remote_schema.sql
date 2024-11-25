SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = off;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
SET default_tablespace = "";
SET default_table_access_method = "heap";
SET check_function_bodies = off;



CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";



CREATE SCHEMA IF NOT EXISTS "private";
ALTER SCHEMA "private" OWNER TO "postgres";
COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."account_type" AS ENUM (
    'debit',
    'credit'
);
ALTER TYPE "public"."account_type" OWNER TO "postgres";

CREATE TYPE "public"."team_roles" AS ENUM (
    'owner',
    'member'
);
ALTER TYPE "public"."team_roles" OWNER TO "postgres";

CREATE TYPE "public"."bank_providers" AS ENUM (
    'plaid'
);
ALTER TYPE "public"."bank_providers" OWNER TO "postgres";

CREATE TYPE "public"."travel_providers" AS ENUM (
    'duffel',
    'amadeus',
    'travelport',
    'direct'
);
ALTER TYPE "public"."travel_providers" OWNER TO "postgres";

CREATE TYPE "public"."connection_status" AS ENUM (
    'disconnected', 
    'connected', 
    'unknown'
);
ALTER TYPE "public"."connection_status" OWNER TO "postgres";

CREATE TYPE "public"."inbox_status" AS ENUM (
    'processing',
    'pending',
    'archived',
    'new',
    'deleted'
);
ALTER TYPE "public"."inbox_status" OWNER TO "postgres";

CREATE TYPE "public"."inbox_type" AS ENUM (
    'invoice', 
    'expense'
);
ALTER TYPE "public"."inbox_type" OWNER TO "postgres";

CREATE TYPE "public"."metrics_record" AS (
    "date" "date",
    "value" integer
);
ALTER TYPE "public"."metrics_record" OWNER TO "postgres";

CREATE TYPE "public"."report_types" AS ENUM (
    'profit', 
    'revenue', 
    'burn_rate', 
    'expense',
    'bookings'
);
ALTER TYPE "public"."report_types" OWNER TO "postgres";

CREATE TYPE "public"."tracker_status" AS ENUM (
    'in_progress',
    'completed'
);
ALTER TYPE "public"."tracker_status" OWNER TO "postgres";

CREATE TYPE "public"."transaction_categories" AS ENUM (
    'flights',
    'stays',
    'tours',
    'car_rentals',
    'transfers',
    'trains',
    'cruises',
    'meals',
    'activity',
    'fees',
    'taxes',
    'other',
    'uncategorized'
);
ALTER TYPE "public"."transaction_categories" OWNER TO "postgres";

CREATE TYPE "public"."transaction_methods" AS ENUM (
    'payment',
    'card_purchase',
    'card_atm',
    'transfer',
    'ach',
    'interest',
    'deposit',
    'wire',
    'fee',
    'other',
    'unknown'
);
ALTER TYPE "public"."transaction_methods" OWNER TO "postgres";

CREATE TYPE "public"."transaction_status" AS ENUM (
    'posted',
    'pending',
    'excluded',
    'completed'
);
ALTER TYPE "public"."transaction_status" OWNER TO "postgres";

CREATE TYPE "public"."transaction_frequency" AS ENUM (
    'weekly',
    'biweekly',
    'monthly',
    'semi_monthly',
    'annually',
    'irregular',
    'unknown'
);
ALTER TYPE "public"."transaction_frequency" OWNER TO "postgres";

CREATE TYPE "public"."booking_type" AS ENUM (
    'flight',
    'hotel',
    'tour',
    'car_rental',
    'cruise',
    'train'
);
ALTER TYPE "public"."booking_type" OWNER TO "postgres";

CREATE TYPE "public"."booking_status" AS ENUM (
    'confirmed',
    'cancelled',
    'pending'
);
ALTER TYPE "public"."booking_status" OWNER TO "postgres";

CREATE TYPE "public"."traveler_type" AS ENUM (
    'adult',
    'child',
    'infant'
);
ALTER TYPE "public"."traveler_type" OWNER TO "postgres";

CREATE TYPE "public"."cabin_class" AS ENUM (
    'economy',
    'premium_economy',
    'business',
    'first'
);
ALTER TYPE "public"."cabin_class" OWNER TO "postgres";

CREATE TYPE "public"."property_type" AS ENUM (
    'hotel',
    'apartment',
    'resort',
    'villa'
);
ALTER TYPE "public"."property_type" OWNER TO "postgres";



CREATE TABLE "public"."apps" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NULL DEFAULT gen_random_uuid(),
    "config" jsonb,
    "created_at" timestamp with time zone NULL DEFAULT now(),
    "created_by" uuid NULL DEFAULT gen_random_uuid(),
    "app_id" text NOT NULL,
    "settings" jsonb NULL,
    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_app_id_team_id" UNIQUE (app_id, team_id)
    CONSTRAINT "apps_created_by_fkey" FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT "integrations_team_id_fkey" FOREIGN KEY (team_id) 
        REFERENCES teams(id) ON DELETE CASCADE,
);

ALTER TABLE "public"."apps" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Apps can be deleted by a member of the team"
ON "public"."apps"
AS permissive
FOR DELETE
TO public
USING ((team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user)));


CREATE POLICY "Apps can be inserted by a member of the team"
ON "public"."apps"
AS permissive
FOR INSERT
TO public
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));


CREATE POLICY "Apps can be selected by a member of the team"
ON "public"."apps"
AS permissive
FOR SELECT
TO public
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));


CREATE POLICY "Apps can be updated by a member of the team"
ON "public"."apps"
AS permissive
FOR UPDATE
TO public
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

GRANT ALL ON TABLE "public"."apps" TO "anon";
GRANT ALL ON TABLE "public"."apps" TO "authenticated";
GRANT ALL ON TABLE "public"."apps" TO "service_role";

CREATE TABLE "public"."bank_accounts" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "created_by" uuid NOT NULL,
    "team_id" uuid NOT NULL,
    "name" text NULL,
    "currency" text NULL,
    "bank_connection_id" uuid NULL,
    "enabled" boolean NOT NULL DEFAULT true,
    "account_id" text NOT NULL,
    "balance" numeric NULL DEFAULT '0'::numeric,
    "manual" boolean NULL DEFAULT false,
    "type" public.account_type NULL,
    "base_balance" numeric NULL,
    "base_currency" text NULL,
    CONSTRAINT bank_accounts_pkey PRIMARY KEY ("id"),
    CONSTRAINT "bank_accounts_bank_connection_id_fkey" FOREIGN KEY (bank_connection_id) 
        REFERENCES bank_connections(id) ON DELETE SET NULL,
    CONSTRAINT "bank_accounts_created_by_fkey" FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT "bank_accounts_team_id_fkey" FOREIGN KEY (team_id) 
        REFERENCES teams(id) ON DELETE CASCADE
);

ALTER TABLE "public"."bank_accounts" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."bank_accounts" TO "anon";
GRANT ALL ON TABLE "public"."bank_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_accounts" TO "service_role";

CREATE INDEX IF NOT EXISTS bank_accounts_bank_connection_id_idx ON public.bank_accounts USING btree (bank_connection_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS bank_accounts_created_by_idx ON public.bank_accounts USING btree (created_by) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS bank_accounts_team_id_idx ON public.bank_accounts USING btree (team_id) TABLESPACE pg_default;
        
CREATE TRIGGER trigger_calculate_bank_account_base_balance_before_insert BEFORE INSERT ON bank_accounts FOR EACH ROW
    EXECUTE FUNCTION calculate_bank_account_base_balance();

CREATE TRIGGER trigger_calculate_bank_account_base_balance_before_update BEFORE UPDATE OF balance ON bank_accounts FOR EACH ROW WHEN (old.balance IS DISTINCT FROM new.balance)
    EXECUTE FUNCTION calculate_bank_account_base_balance();

CREATE POLICY "Bank Accounts can be created by a member of the team" 
ON "public"."bank_accounts" 
FOR INSERT 
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Bank Accounts can be deleted by a member of the team" 
ON "public"."bank_accounts" 
FOR DELETE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Bank Accounts can be selected by a member of the team" 
ON "public"."bank_accounts" 
FOR SELECT 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Bank Accounts can be updated by a member of the team" 
ON "public"."bank_accounts" 
FOR UPDATE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE TABLE "public"."bank_connections" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "institution_id" text NOT NULL,
    "expires_at" timestamp with time zone NULL,
    "team_id" uuid NOT NULL,
    "name" text NOT NULL,
    "logo_url" text NULL,
    "access_token" text NULL,
    "enrollment_id" text NULL,
    "provider" public.bank_providers NULL,
    "error_details" text NULL,
    "last_accessed" timestamp with time zone NULL,
    "reference_id" text NULL,
    "status" public.connection_status NULL DEFAULT 'connected'::connection_status,
    CONSTRAINT "bank_connections_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_bank_connections" UNIQUE (team_id, institution_id),
    CONSTRAINT "bank_connections_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

ALTER TABLE "public"."bank_connections" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."bank_connections" TO "anon";
GRANT ALL ON TABLE "public"."bank_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_connections" TO "service_role";

CREATE INDEX IF NOT EXISTS bank_connections_team_id_idx ON public.bank_connections USING btree (team_id) TABLESPACE pg_default;

CREATE POLICY "Bank Connections can be created by a member of the team" 
ON "public"."bank_connections" 
FOR INSERT 
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Bank Connections can be deleted by a member of the team" 
ON "public"."bank_connections" 
FOR DELETE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Bank Connections can be selected by a member of the team" 
ON "public"."bank_connections" 
FOR SELECT 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Bank Connections can be updated by a member of the team" 
ON "public"."bank_connections" 
FOR UPDATE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE TABLE "public"."documents" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text NULL,
    "created_at" timestamp with time zone NULL DEFAULT now(),
    "metadata" jsonb NULL,
    "path_tokens" text[] NULL,
    "team_id" uuid NULL,
    "parent_id" text NULL,
    "object_id" uuid NULL,
    "owner_id" uuid NULL,
    "tag" text NULL,
    "title" text NULL,
    "body" text NULL,
    "fts" tsvector GENERATED ALWAYS AS (
      to_tsvector(
        'english'::regconfig,
        ((title || ' '::text) || body)
      )
    ) stored null,
    CONSTRAINT "documents_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "documents_created_by_fkey" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT "documents_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS documents_team_id_idx ON public.documents USING btree (team_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS documents_team_id_parent_id_idx ON public.documents USING btree (team_id, parent_id) TABLESPACE pg_default;

CREATE TRIGGER embed_document
AFTER INSERT ON documents FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request (
  'https://hfgtyawqemeozrtjzevl.supabase.co/functions/v1/generate-document-embedding',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);

CREATE POLICY "Documents can be deleted by a member of the team"
ON "public"."documents"
AS permissive
FOR ALL
TO public
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));


CREATE POLICY "Documents can be selected by a member of the team"
ON "public"."documents"
AS permissive
FOR ALL
TO public
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));


CREATE POLICY "Documents can be updated by a member of the team"
ON "public"."documents"
AS permissive
FOR UPDATE
TO public
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));


CREATE POLICY "Enable insert for authenticated users only"
ON "public"."documents"
AS permissive
FOR INSERT
TO authenticated
WITH CHECK (true);

GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";

CREATE TABLE "public"."exchange_rates" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "base" text NULL,
    "rate" numeric NULL,
    "target" text NULL,
    "updated_at" timestamp with time zone NULL,
    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_rate" UNIQUE ("base", "target")
);

ALTER TABLE "public"."exchange_rates" ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS exchange_rates_base_target_idx ON public.exchange_rates USING btree (base, target) TABLESPACE pg_default;

CREATE POLICY "Enable read access for authenticated users"
ON "public"."exchange_rates"
AS permissive
FOR SELECT
TO public
USING (true);

GRANT ALL ON TABLE "public"."exchange_rates" TO "anon";
GRANT ALL ON TABLE "public"."exchange_rates" TO "authenticated";
GRANT ALL ON TABLE "public"."exchange_rates" TO "service_role";

CREATE TABLE "public"."inbox" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "team_id" uuid NULL,
    "file_path" text[] NULL,
    "file_name" text NULL,
    "transaction_id" uuid NULL,
    "amount" numeric NULL,
    "currency" text NULL,
    "content_type" text NULL,
    "size" bigint NULL,
    "attachment_id" uuid NULL,
    "forwarded_to" text NULL,
    "reference_id" text NULL,
    "meta" jsonb NULL,
    "status" public.inbox_status NULL DEFAULT 'new'::inbox_status,
    "website" text NULL,
    "display_name" text NULL,
    "fts" tsvector GENERATED ALWAYS AS (
      generate_inbox_fts (
        display_name,
        extract_product_names ((meta -> 'products'::text))
      )
    ) stored null,
    "base_amount" numeric NULL,
    "base_currency" text NULL,
    "date" date NULL,
    "description" text NULL,
    "type" public.inbox_type NULL,
    CONSTRAINT "inbox_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inbox_reference_id_key" UNIQUE ("reference_id"),
    CONSTRAINT "inbox_attachment_id_fkey" FOREIGN KEY (attachment_id) REFERENCES transaction_attachments (id) ON DELETE SET NULL,
    CONSTRAINT "public_inbox_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT "public_inbox_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE SET NULL
);

ALTER TABLE "public"."inbox" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."inbox" OWNER TO "postgres";

GRANT ALL ON TABLE "public"."inbox" TO "anon";
GRANT ALL ON TABLE "public"."inbox" TO "authenticated";
GRANT ALL ON TABLE "public"."inbox" TO "service_role";

CREATE INDEX IF NOT EXISTS inbox_attachment_id_idx ON public.inbox USING btree (attachment_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS inbox_team_id_idx ON public.inbox USING btree (team_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS inbox_transaction_id_idx ON public.inbox USING btree (transaction_id) TABLESPACE pg_default;

CREATE TRIGGER trigger_calculate_inbox_base_amount_before_update BEFORE
UPDATE ON inbox FOR EACH ROW WHEN (old.amount IS DISTINCT FROM new.amount)
EXECUTE FUNCTION calculate_inbox_base_amount ();

CREATE POLICY "Inbox can be deleted by a member of the team" 
ON "public"."inbox" 
FOR DELETE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Inbox can be selected by a member of the team" 
ON "public"."inbox" 
FOR SELECT 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Inbox can be updated by a member of the team" 
ON "public"."inbox" 
FOR UPDATE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE TABLE "public"."reports" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "link_id" text NULL,
    "team_id" uuid NULL,
    "short_link" text NULL,
    "from" timestamp with time zone NULL,
    "to" timestamp with time zone NULL,
    "type" public.reportTypes NULL,
    "expire_at" timestamp with time zone NULL,
    "currency" text NULL,
    "created_by" uuid NULL,
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "public_reports_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT "reports_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams (id) ON UPDATE CASCADE
);

ALTER TABLE "public"."reports" OWNER TO "postgres";

ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";

CREATE INDEX IF NOT EXISTS reports_team_id_idx ON public.reports USING btree (team_id) TABLESPACE pg_default;

CREATE POLICY "Reports can be created by a member of the team" 
ON "public"."reports" 
FOR INSERT 
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Reports can be deleted by a member of the team" 
ON "public"."reports" 
FOR DELETE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Reports can be handled by a member of the team" 
ON "public"."tracker_reports" 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Reports can be selected by a member of the team" 
ON "public"."reports" 
FOR SELECT 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Reports can be updated by member of team" 
ON "public"."reports" 
FOR UPDATE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));


CREATE TABLE "public"."teams" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "name" text NULL,
    "logo_url" text NULL,
    "inbox_id" text NULL DEFAULT generate_inbox (10),
    "email" text NULL,
    "inbox_email" text NULL,
    "inbox_forwarding" boolean NULL DEFAULT true,
    "base_currency" text NULL,
    "document_classification" boolean NULL DEFAULT false,
    CONSTRAINT "teams_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "teams_inbox_id_key" UNIQUE ("inbox_id")
);

ALTER TABLE "public"."teams" OWNER TO "postgres";

ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";

CREATE POLICY "Enable insert for authenticated users only" 
ON "public"."teams" 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Invited users can select team if they are invited." 
ON "public"."teams" 
FOR SELECT 
USING (id IN ( SELECT private.get_invites_for_authenticated_user() AS get_invites_for_authenticated_user));

CREATE POLICY "Teams can be deleted by a member of the team" 
ON "public"."teams" 
FOR DELETE 
USING (id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Teams can be selected by a member of the team" 
ON "public"."teams" 
FOR SELECT 
USING (id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Teams can be updated by a member of the team" 
ON "public"."teams" 
FOR UPDATE 
USING (id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));


CREATE TABLE "public"."tracker_entries" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "duration" bigint NULL,
    "project_id" uuid NULL,
    "start" timestamp with time zone NULL,
    "stop" timestamp with time zone NULL,
    "assigned_id" uuid NULL,
    "team_id" uuid NULL,
    "description" text NULL,
    "rate" numeric NULL DEFAULT 0,
    "currency" text NULL,
    "billed" boolean NULL DEFAULT false,
    "date" date NULL DEFAULT now(),
    CONSTRAINT "tracker_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tracker_entries_assigned_id_fkey" FOREIGN KEY (assigned_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT "tracker_entries_project_id_fkey" FOREIGN KEY (project_id) REFERENCES tracker_projects (id) ON DELETE CASCADE,
    CONSTRAINT "tracker_entries_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
);

COMMENT ON COLUMN "public"."tracker_entries"."duration" IS 'Time entry duration. For running entries should be negative, preferable -1';
COMMENT ON COLUMN "public"."tracker_entries"."start" IS 'Start time in UTC';
COMMENT ON COLUMN "public"."tracker_entries"."stop" IS 'Stop time in UTC, can be null if it''s still running or created with duration';
COMMENT ON COLUMN "public"."tracker_entries"."description" IS 'Time Entry description, null if not provided at creation/update';

ALTER TABLE "public"."tracker_entries" OWNER TO "postgres";

ALTER TABLE "public"."tracker_entries" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."tracker_entries" TO "anon";
GRANT ALL ON TABLE "public"."tracker_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."tracker_entries" TO "service_role";

CREATE INDEX IF NOT EXISTS tracker_entries_team_id_idx ON public.tracker_entries USING btree (team_id) TABLESPACE pg_default;

CREATE POLICY "Entries can be created by a member of the team" 
ON "public"."tracker_entries" 
FOR INSERT 
TO authenticated
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Entries can be deleted by a member of the team" 
ON "public"."tracker_entries" 
FOR DELETE 
TO authenticated
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Entries can be selected by a member of the team" 
ON "public"."tracker_entries" 
FOR SELECT 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Entries can be updated by a member of the team"
ON "public"."tracker_entries"
AS permissive
FOR UPDATE
TO authenticated
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user))
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE TABLE "public"."tracker_projects" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "team_id" uuid NULL,
    "rate" numeric NULL,
    "currency" text NULL,
    "status" public.trackerStatus NOT NULL DEFAULT 'in_progress'::trackerStatus,
    "description" text NULL,
    "name" text NOT NULL,
    "billable" boolean NULL DEFAULT false,
    "estimate" bigint NULL,
    CONSTRAINT "tracker_projects_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tracker_projects_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
);

ALTER TABLE "public"."tracker_projects" OWNER TO "postgres";

ALTER TABLE "public"."tracker_projects" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."tracker_projects" TO "anon";
GRANT ALL ON TABLE "public"."tracker_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."tracker_projects" TO "service_role";

CREATE INDEX IF NOT EXISTS tracker_projects_team_id_idx ON public.tracker_projects USING btree (team_id) TABLESPACE pg_default;

CREATE POLICY "Projects can be created by a member of the team" 
ON "public"."tracker_projects" 
FOR INSERT 
TO authenticated
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Projects can be deleted by a member of the team" 
ON "public"."tracker_projects" 
FOR DELETE 
TO authenticated
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Projects can be selected by a member of the team" 
ON "public"."tracker_projects" 
FOR SELECT 
TO authenticated
USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE POLICY "Projects can be updated by a member of the team" 
ON "public"."tracker_projects" 
FOR UPDATE 
TO authenticated
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user))
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE TABLE "public"."tracker_reports" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "link_id" text NULL,
    "short_link" text NULL,
    "team_id" uuid NULL DEFAULT gen_random_uuid(),
    "project_id" uuid NULL DEFAULT gen_random_uuid(),
    "created_by" uuid NULL,
    CONSTRAINT "project_reports_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "public_tracker_reports_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT "public_tracker_reports_project_id_fkey" FOREIGN KEY (project_id) REFERENCES tracker_projects (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "tracker_reports_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams (id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE "public"."tracker_reports" OWNER TO "postgres";

ALTER TABLE "public"."tracker_reports" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."tracker_reports" TO "anon";
GRANT ALL ON TABLE "public"."tracker_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."tracker_reports" TO "service_role";

CREATE INDEX IF NOT EXISTS tracker_reports_team_id_idx ON public.tracker_reports USING btree (team_id) TABLESPACE pg_default;

CREATE POLICY "Reports can be handled by a member of the team" 
ON "public"."tracker_reports" 
USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE TABLE "public"."transaction_attachments" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "type" text NULL,
    "transaction_id" uuid NULL,
    "team_id" uuid NULL,
    "size" bigint NULL,
    "name" text NULL,
    "path" text[] NULL,
    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "public_transaction_attachments_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT "public_transaction_attachments_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE SET NULL
);

ALTER TABLE "public"."transaction_attachments" OWNER TO "postgres";

ALTER TABLE "public"."transaction_attachments" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."transaction_attachments" TO "anon";
GRANT ALL ON TABLE "public"."transaction_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."transaction_attachments" TO "service_role";

CREATE INDEX IF NOT EXISTS transaction_enrichments_team_id_idx ON public.transaction_enrichments USING btree (team_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS transaction_attachments_transaction_id_idx ON public.transaction_attachments USING btree (transaction_id) TABLESPACE pg_default;

CREATE POLICY "Transaction Attachments can be created by a member of the team" 
ON "public"."transaction_attachments" 
FOR INSERT 
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Transaction Attachments can be deleted by a member of the team" 
ON "public"."transaction_attachments" 
FOR DELETE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Transaction Attachments can be selected by a member of the team" 
ON "public"."transaction_attachments" 
FOR SELECT 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Transaction Attachments can be updated by a member of the team" 
ON "public"."transaction_attachments" 
FOR UPDATE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE TABLE "public"."transaction_categories" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "team_id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "color" text NULL,
    "created_at" timestamp with time zone NULL DEFAULT now(),
    "system" boolean NULL DEFAULT false,
    "slug" text NOT NULL,
    "vat" numeric NULL,
    "description" text NULL,
    "embedding" extensions.vector NULL,
    CONSTRAINT "transaction_categories_pkey" PRIMARY KEY ("team_id", "slug"),
    CONSTRAINT "unique_team_slug" UNIQUE ("team_id", "slug"),
    CONSTRAINT "transaction_categories_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE  
);

ALTER TABLE "public"."transaction_categories" OWNER TO "postgres";

ALTER TABLE "public"."transaction_categories" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."transaction_categories" TO "anon";
GRANT ALL ON TABLE "public"."transaction_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."transaction_categories" TO "service_role";

CREATE INDEX IF NOT EXISTS transaction_categories_team_id_idx ON public.transaction_categories USING btree (team_id) TABLESPACE pg_default;

CREATE POLICY "Users on team can manage categories" 
ON "public"."transaction_categories" 
USING (("team_id" IN ( SELECT "private"."get_teams_for_authenticated_user"() AS "get_teams_for_authenticated_user")));

CREATE TRIGGER embed_category
AFTER INSERT
OR UPDATE ON transaction_categories
FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request (
  'https://hfgtyawqemeozrtjzevl.supabase.co/functions/v1/generate-category-embedding',
  'POST',
  '{"Content-type":"application/json"}',
  '{}',
  '5000'
);

CREATE TRIGGER generate_category_slug
BEFORE INSERT ON transaction_categories
FOR EACH ROW
EXECUTE FUNCTION generate_slug_from_name ();

CREATE TRIGGER trigger_update_transactions_category
BEFORE DELETE ON transaction_categories
FOR EACH ROW
EXECUTE FUNCTION update_transactions_on_category_delete ();

CREATE TABLE "public"."transaction_enrichments" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "name" text NULL,
    "team_id" uuid NULL,
    "category_slug" text NULL,
    "system" boolean NULL DEFAULT false,
    CONSTRAINT "transaction_enrichments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_team_name" UNIQUE ("team_id", "name"),
    CONSTRAINT "transaction_enrichments_category_slug_team_id_fkey" FOREIGN KEY ("category_slug", "team_id") REFERENCES transaction_categories ("slug", "team_id") ON DELETE CASCADE,
    CONSTRAINT "transaction_enrichments_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
);

ALTER TABLE "public"."transaction_enrichments" OWNER TO "postgres";

ALTER TABLE "public"."transaction_enrichments" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."transaction_enrichments" TO "anon";
GRANT ALL ON TABLE "public"."transaction_enrichments" TO "authenticated";
GRANT ALL ON TABLE "public"."transaction_enrichments" TO "service_role";

CREATE INDEX IF NOT EXISTS transaction_enrichments_category_slug_team_id_idx ON public.transaction_enrichments USING btree (category_slug, team_id) TABLESPACE pg_default;

CREATE POLICY "Enable insert for authenticated users only" 
ON "public"."transaction_enrichments" 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" 
ON "public"."transaction_enrichments" 
FOR UPDATE 
TO authenticated
WITH CHECK (true);

CREATE TABLE "public"."transactions" (
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "date" date NOT NULL,
    "name" text NOT NULL,
    "method" public.transactionMethods NOT NULL,
    "amount" numeric NOT NULL,
    "currency" text NOT NULL,
    "team_id" uuid NOT NULL,
    "assigned_id" uuid NULL,
    "note" character varying NULL,
    "bank_account_id" uuid NULL,
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "internal_id" text NOT NULL,
    "status" public.transactionStatus NULL DEFAULT 'posted'::transactionStatus,
    "category" public.transactionCategories NULL,
    "balance" numeric NULL,
    "manual" boolean NULL DEFAULT false,
    "description" text NULL,
    "category_slug" text NULL,
    "base_amount" numeric NULL,
    "base_currency" text NULL,
    "frequency" public.transaction_frequency NULL,
    "fts_vector" tsvector GENERATED ALWAYS AS (
      to_tsvector(
        'english'::regconfig,
        (
          (coalesce(name, ''::text) || ' '::text) || coalesce(description, ''::text)
        )
      )
    ) stored null,
    "recurring" boolean NULL,
    "updated_at" timestamp with time zone NULL,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "transactions_internal_id_key" UNIQUE ("internal_id"),
    CONSTRAINT "public_transactions_assigned_id_fkey" FOREIGN KEY (assigned_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT "public_transactions_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT "transactions_bank_account_id_fkey" FOREIGN KEY (bank_account_id) REFERENCES bank_accounts (id) ON DELETE CASCADE,
    CONSTRAINT "transactions_category_slug_team_id_fkey" FOREIGN KEY ("category_slug", "team_id") REFERENCES transaction_categories ("slug", "team_id")
);

ALTER TABLE "public"."transactions" OWNER TO "postgres";

ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";

CREATE INDEX IF NOT EXISTS transactions_category_slug_idx ON public.transactions USING btree (category_slug) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS transactions_team_id_date_currency_bank_account_id_category_idx ON public.transactions USING btree (
  team_id,
  date,
  currency,
  bank_account_id,
  category
) tablespace pg_default;

CREATE INDEX IF NOT EXISTS transactions_team_id_idx ON public.transactions USING btree (team_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS transactions_assigned_id_idx ON public.transactions USING btree (assigned_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS transactions_bank_account_id_idx ON public.transactions USING btree (bank_account_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions USING btree (date) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_transactions_fts ON public.transactions USING gin (fts_vector) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_transactions_fts_vector ON public.transactions USING gin (fts_vector) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_transactions_id ON public.transactions USING btree (id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_transactions_name ON public.transactions USING btree (name) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_transactions_name_trigram ON public.transactions USING gin (name gin_trgm_ops) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_transactions_team_id_date_name ON public.transactions USING btree (team_id, date, name) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_transactions_team_id_name ON public.transactions USING btree (team_id, name) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_trgm_name ON public.transactions USING gist (name gist_trgm_ops) TABLESPACE pg_default;

CREATE TRIGGER on_updated_transaction_category AFTER
UPDATE OF category_slug ON transactions FOR EACH ROW
EXECUTE FUNCTION upsert_transaction_enrichment ();

CREATE TRIGGER check_recurring_transactions AFTER
INSERT ON transactions FOR EACH ROW
EXECUTE FUNCTION detect_recurring_transactions ();

CREATE TRIGGER on_update_set_set_updated_at BEFORE
UPDATE ON transactions FOR EACH ROW
EXECUTE FUNCTION set_updated_at ();

CREATE TRIGGER trigger_calculate_transaction_base_amount_before_insert BEFORE INSERT ON transactions FOR EACH ROW
EXECUTE FUNCTION calculate_transaction_base_amount ();

CREATE TRIGGER enrich_transaction BEFORE INSERT ON transactions FOR EACH ROW
EXECUTE FUNCTION update_enrich_transaction ();

CREATE POLICY "Transactions can be created by a member of the team" 
ON "public"."transactions" 
FOR INSERT 
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Transactions can be deleted by a member of the team" 
ON "public"."transactions" 
FOR DELETE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Transactions can be selected by a member of the team" 
ON "public"."transactions" 
FOR SELECT 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Transactions can be updated by a member of the team" 
ON "public"."transactions" 
FOR UPDATE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE TABLE "public"."user_invites" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "team_id" uuid NULL,
    "email" text NULL,
    "role" public.teamRoles NULL,
    "code" text NULL DEFAULT nanoid (24),
    "invited_by" uuid NULL,
    CONSTRAINT "user_invites_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "unique_team_invite" UNIQUE ("email", "team_id"),
    CONSTRAINT "user_invites_code_key" UNIQUE ("code"),
    CONSTRAINT "public_user_invites_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT "user_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES users (id) ON DELETE CASCADE    
);

ALTER TABLE "public"."user_invites" OWNER TO "postgres";

ALTER TABLE "public"."user_invites" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."user_invites" TO "anon";
GRANT ALL ON TABLE "public"."user_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_invites" TO "service_role";

CREATE INDEX IF NOT EXISTS user_invites_team_id_idx ON public.user_invites USING btree (team_id) TABLESPACE pg_default;


CREATE POLICY "Enable select for users based on email" 
ON "public"."user_invites" 
FOR SELECT 
USING ((auth.jwt() ->> 'email'::text) = email);

CREATE POLICY "User Invites can be created by a member of the team" 
ON "public"."user_invites" 
FOR INSERT 
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "User Invites can be deleted by a member of the team" 
ON "public"."user_invites" 
FOR DELETE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "User Invites can be deleted by invited email" 
ON "public"."user_invites" 
FOR DELETE 
USING ((auth.jwt() ->> 'email'::text) = email);

CREATE POLICY "User Invites can be selected by a member of the team" 
ON "public"."user_invites" 
FOR SELECT 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "User Invites can be updated by a member of the team" 
ON "public"."user_invites" 
FOR UPDATE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));


CREATE TABLE "public"."users" (
    "id" uuid NOT NULL,
    "full_name" text NULL,
    "avatar_url" text NULL,
    "email" text NULL,
    "team_id" uuid NULL,
    "created_at" timestamp with time zone NULL DEFAULT now(),
    "locale" text NULL DEFAULT 'en'::text,
    "week_starts_on_monday" boolean NULL DEFAULT false,
    "timezone" text NULL,
    "time_format" numeric NULL DEFAULT '24'::numeric,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES auth.users (id) ON DELETE CASCADE,
    CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES teams (id) ON DELETE SET NULL
);

ALTER TABLE "public"."users" OWNER TO "postgres";

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

CREATE INDEX IF NOT EXISTS users_team_id_idx ON public.users USING btree (team_id) TABLESPACE pg_default;

CREATE POLICY "Users can insert their own profile." 
ON "public"."users" 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can select their own profile." 
ON "public"."users" 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can select users if they are in the same team" 
ON "public"."users" 
FOR SELECT 
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM "public"."users_on_team"
  WHERE (("users_on_team"."user_id" = ( SELECT auth.uid() AS uid)) AND ("users_on_team"."team_id" = "users"."team_id")))));

CREATE POLICY "Users can update own profile." 
ON "public"."users" 
FOR UPDATE 
USING (auth.uid() = id);


CREATE TABLE "public"."users_on_team" (
    "user_id" uuid NOT NULL,
    "team_id" uuid NOT NULL,
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "role" public.teamRoles NULL,
    "created_at" timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT "members_pkey" PRIMARY KEY ("user_id", "team_id", "id"),
    CONSTRAINT "users_on_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES teams (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "users_on_team_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES users (id) ON DELETE CASCADE 
);

ALTER TABLE "public"."users_on_team" OWNER TO "postgres";

ALTER TABLE "public"."users_on_team" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."users_on_team" TO "anon";
GRANT ALL ON TABLE "public"."users_on_team" TO "authenticated";
GRANT ALL ON TABLE "public"."users_on_team" TO "service_role";

CREATE INDEX IF NOT EXISTS users_on_team_team_id_idx ON public.users_on_team USING btree (team_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS users_on_team_user_id_idx ON public.users_on_team USING btree (user_id) TABLESPACE pg_default;

CREATE POLICY "Enable insert for authenticated users only" 
ON "public"."users_on_team" 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable updates for users on team" 
ON "public"."users_on_team" 
FOR UPDATE 
TO authenticated
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user))
WITH CHECK (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE POLICY "Select for current user teams"
ON "public"."users_on_team"
FOR SELECT 
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM private.current_user_teams cut
  WHERE ((cut.user_id = ( SELECT auth.uid() AS uid)) AND (cut.team_id = users_on_team.team_id)))));

CREATE POLICY "Users on team can be deleted by a member of the team" 
ON "public"."users_on_team" 
FOR DELETE 
USING (team_id IN ( SELECT private.get_teams_for_authenticated_user() AS get_teams_for_authenticated_user));

CREATE OR REPLACE VIEW "private"."current_user_teams" AS 
SELECT ( SELECT auth.uid() AS uid) AS user_id,
    t.team_id
   FROM users_on_team t
  WHERE (t.user_id = ( SELECT auth.uid() AS uid));

CREATE OR REPLACE FUNCTION "private"."get_invites_for_authenticated_user"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT team_id
  FROM user_invites
  WHERE email = auth.jwt() ->> 'email'
$$;

ALTER FUNCTION "private"."get_invites_for_authenticated_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "private"."get_teams_for_authenticated_user"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT team_id
  FROM users_on_team
  WHERE user_id = auth.uid()
$$;

ALTER FUNCTION "private"."get_teams_for_authenticated_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION public.amount_text("public"."transactions") RETURNS "text"
    LANGUAGE "sql"
    AS $$
  select ABS($1.amount)::text;
$$;

ALTER FUNCTION public.amount_text("public"."transactions") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.amount_text("public"."transactions") TO "anon";
GRANT ALL ON FUNCTION public.amount_text("public"."transactions") TO "authenticated";
GRANT ALL ON FUNCTION public.amount_text("public"."transactions") TO "service_role";

CREATE OR REPLACE FUNCTION public.calculate_amount_similarity(transaction_currency text, inbox_currency text, transaction_amount numeric, inbox_amount numeric)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
  similarity_score numeric := 0;
  relative_difference numeric;
  abs_transaction_amount numeric;
  abs_inbox_amount numeric;
begin
  if transaction_currency = inbox_currency then
    abs_transaction_amount := abs(transaction_amount);
    abs_inbox_amount := abs(inbox_amount);
    
    relative_difference := abs(abs_transaction_amount - abs_inbox_amount) / greatest(abs_transaction_amount, abs_inbox_amount, 1);
    
    if relative_difference < 0.02 then -- Further relaxed threshold for exact matches
      similarity_score := 1;
    elsif relative_difference < 0.08 then -- Further relaxed threshold for very close matches
      similarity_score := 0.9;
    elsif relative_difference < 0.15 then -- Added an intermediate tier
      similarity_score := 0.8;
    else
      similarity_score := 1 - least(relative_difference, 1);
      similarity_score := similarity_score * similarity_score * 0.9; -- Increased quadratic scaling factor for more leniency
    end if;
  else
    -- Add a small similarity score even if currencies don't match
    similarity_score := 0.1;
  end if;

  return round(least(similarity_score, 1), 2);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_bank_account_base_balance()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    team_base_currency text;
    exchange_rate numeric;
begin
    begin
        select base_currency into team_base_currency
        from teams
        where id = new.team_id;

        -- If the account currency is the same as the team's base currency or the team's base currency is null
        if new.currency = team_base_currency or team_base_currency is null then
            new.base_balance := new.balance;
            new.base_currency := new.currency;
        else
            select rate into exchange_rate
            from exchange_rates
            where base = new.currency
            and target = team_base_currency
            limit 1;

            if exchange_rate is null then
                raise exception 'Exchange rate not found for % to %', new.currency, team_base_currency;
            end if;

            new.base_balance := round(new.balance * exchange_rate, 2);
            new.base_currency := team_base_currency;
        end if;

        return new;
    exception
        when others then
            -- Log the error
            raise log 'Error in calculate_bank_account_base_balance: %', sqlerrm;
            -- Set default values in case of error
            new.base_balance := new.balance;
            new.base_currency := new.currency;
            return new;
    end;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_base_amount_score(transaction_base_currency text, inbox_base_currency text, transaction_base_amount numeric, inbox_base_amount numeric)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
  final_score numeric := 0;
  relative_amount_difference numeric;
begin
  if transaction_base_currency = inbox_base_currency then
    -- Normalize amounts by taking their absolute values
    declare
      abs_transaction_amount numeric := abs(transaction_base_amount);
      abs_inbox_amount numeric := abs(inbox_base_amount);
    begin
      -- Calculate the relative difference between normalized base amounts
      relative_amount_difference := abs(abs_transaction_amount - abs_inbox_amount) / greatest(abs_transaction_amount, abs_inbox_amount, 1);
      
      -- Calculate score based on the similarity of amounts
      final_score := 1 - least(relative_amount_difference, 1);
      
      -- Apply quadratic scaling to give more weight to very close matches
      final_score := final_score * final_score * 0.5;
      
      -- Add a bonus for very close matches, but ensure it doesn't reach 1
      if relative_amount_difference < 0.1 then
        final_score := final_score + 0.3;
      end if;
    end;
  end if;

  -- Ensure the score never exceeds 0.8 and round to two decimal places
  return round(least(final_score, 0.8), 2);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_date_proximity_score(t_date date, i_date date)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
  v_date_diff integer;
  v_score numeric := 0;
begin
  -- Calculate the absolute difference in days
  v_date_diff := abs(t_date - i_date);
  
  -- Calculate score based on date proximity
  -- We give higher score for dates that are closer
  if v_date_diff = 0 then
    v_score := 0.8;  -- Increased from 0.5 to 0.8 for exact matches
  elsif v_date_diff <= 3 then
    -- Higher score for dates within 3 days
    v_score := round(0.7 * (1 - (v_date_diff / 3.0))::numeric, 2);
  elsif v_date_diff <= 7 then
    -- Moderate score for dates within a week
    v_score := round(0.5 * (1 - ((v_date_diff - 3) / 4.0))::numeric, 2);
  elsif v_date_diff <= 30 then
    -- Lower score for dates within a month
    v_score := round(0.3 * (1 - ln(v_date_diff - 6) / ln(25))::numeric, 2);
  end if;

  return v_score;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_date_similarity(transaction_date date, inbox_date date)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
  date_difference integer;
begin
  date_difference := abs(transaction_date - inbox_date);
  
  return case
    when date_difference = 0 then 1
    when date_difference <= 3 then 0.9 -- Increased score for 1-3 day difference
    when date_difference <= 7 then 0.7 -- Increased score for 4-7 day difference
    when date_difference <= 14 then 0.5 -- Increased score for 8-14 day difference
    when date_difference <= 30 then 0.3 -- Added score for 15-30 day difference
    else 0.1 -- Small base score for any match
  end;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_inbox_base_amount()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    team_base_currency text;
    exchange_rate numeric;
begin
    begin
        select base_currency into team_base_currency
        from teams
        where id = new.team_id;

        -- if the inbox item currency is the same as the team's base currency or the team's base currency is null
        if new.currency = team_base_currency or team_base_currency is null then
            new.base_amount := new.amount;
            new.base_currency := new.currency;
        else
            begin
                select rate into exchange_rate
                from exchange_rates
                where base = new.currency
                and target = team_base_currency
                limit 1;

                if exchange_rate is null then
                    raise exception 'Exchange rate not found for % to %', new.currency, team_base_currency;
                end if;

                new.base_amount := round(new.amount * exchange_rate, 2);
                new.base_currency := team_base_currency;
            exception
                when others then
                    raise log 'Error calculating exchange rate: %', sqlerrm;
                    -- Set default values in case of error
                    new.base_amount := new.amount;
                    new.base_currency := new.currency;
            end;
        end if;
    exception
        when others then
            raise log 'Error in calculate_inbox_base_amount: %', sqlerrm;
            -- Set default values in case of error
            new.base_amount := new.amount;
            new.base_currency := new.currency;
    end;

    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_match_score(t_record record, i_record record)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
  v_score numeric := 0;
  v_date_diff integer;
  v_name_similarity numeric;
  v_amount_diff numeric;
begin
  -- Exact currency and amount match
  if t_record.currency = i_record.currency and abs(t_record.abs_amount - i_record.amount) < 0.01 then
    v_score := 1;
  else
    -- Base amount and currency similarity
    v_score := v_score + calculate_base_amount_score(
      t_record.base_currency,
      i_record.base_currency,
      t_record.base_amount,
      i_record.base_amount
    );
  end if;

  -- Only proceed with additional scoring if the score is below 1
  if v_score < 1 then
    -- Date proximity
    v_score := v_score + calculate_date_proximity_score(t_record.date, i_record.date);
  end if;

  if v_score < 0.9 then
    -- Name similarity
    v_score := v_score + calculate_name_similarity_score(t_record.name, i_record.display_name);
  end if;

  -- Ensure the score never exceeds 1
  return least(v_score, 1);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_date_similarity(transaction_date date, inbox_date date)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
  date_difference integer;
begin
  date_difference := abs(transaction_date - inbox_date);
  
  return case
    when date_difference = 0 then 1
    when date_difference <= 3 then 0.9 -- Increased score for 1-3 day difference
    when date_difference <= 7 then 0.7 -- Increased score for 4-7 day difference
    when date_difference <= 14 then 0.5 -- Increased score for 8-14 day difference
    when date_difference <= 30 then 0.3 -- Added score for 15-30 day difference
    else 0.1 -- Small base score for any match
  end;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_inbox_base_amount()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    team_base_currency text;
    exchange_rate numeric;
begin
    begin
        select base_currency into team_base_currency
        from teams
        where id = new.team_id;

        -- if the inbox item currency is the same as the team's base currency or the team's base currency is null
        if new.currency = team_base_currency or team_base_currency is null then
            new.base_amount := new.amount;
            new.base_currency := new.currency;
        else
            begin
                select rate into exchange_rate
                from exchange_rates
                where base = new.currency
                and target = team_base_currency
                limit 1;

                if exchange_rate is null then
                    raise exception 'Exchange rate not found for % to %', new.currency, team_base_currency;
                end if;

                new.base_amount := round(new.amount * exchange_rate, 2);
                new.base_currency := team_base_currency;
            exception
                when others then
                    raise log 'Error calculating exchange rate: %', sqlerrm;
                    -- Set default values in case of error
                    new.base_amount := new.amount;
                    new.base_currency := new.currency;
            end;
        end if;
    exception
        when others then
            raise log 'Error in calculate_inbox_base_amount: %', sqlerrm;
            -- Set default values in case of error
            new.base_amount := new.amount;
            new.base_currency := new.currency;
    end;

    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_match_score(t_record record, i_record record)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
  v_score numeric := 0;
  v_date_diff integer;
  v_name_similarity numeric;
  v_amount_diff numeric;
begin
  -- Exact currency and amount match
  if t_record.currency = i_record.currency and abs(t_record.abs_amount - i_record.amount) < 0.01 then
    v_score := 1;
  else
    -- Base amount and currency similarity
    v_score := v_score + calculate_base_amount_score(
      t_record.base_currency,
      i_record.base_currency,
      t_record.base_amount,
      i_record.base_amount
    );
  end if;

  -- Only proceed with additional scoring if the score is below 1
  if v_score < 1 then
    -- Date proximity
    v_score := v_score + calculate_date_proximity_score(t_record.date, i_record.date);
  end if;

  if v_score < 0.9 then
    -- Name similarity
    v_score := v_score + calculate_name_similarity_score(t_record.name, i_record.display_name);
  end if;

  -- Ensure the score never exceeds 1
  return least(v_score, 1);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_name_similarity_score(transaction_name text, inbox_name text)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
  name_similarity numeric;
  similarity_score numeric := 0;
begin
  if transaction_name is null or inbox_name is null then
    return 0;
  end if;

  name_similarity := similarity(lower(transaction_name), lower(inbox_name));
  similarity_score := 0.7 * name_similarity; -- Increased base score to 70% of calculated similarity
  
  if name_similarity > 0.8 then -- Lowered threshold for bonus points
    similarity_score := similarity_score + 0.3;
  end if;
  
  return round(least(similarity_score, 1), 2); -- Increased cap to 1
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_overall_similarity(transaction_record record, inbox_record record)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
  overall_score numeric := 0;
  amount_score numeric;
  date_score numeric;
  name_score numeric;
begin
  -- Calculate individual scores
  amount_score := calculate_amount_similarity(
    transaction_record.currency,
    inbox_record.currency,
    transaction_record.amount,
    inbox_record.amount
  );
  date_score := calculate_date_similarity(transaction_record.date, inbox_record.date);
  name_score := calculate_name_similarity_score(transaction_record.name, inbox_record.display_name);

  -- Adjusted weighted combination of scores (70% amount, 20% date, 10% name)
  overall_score := (amount_score * 0.70) + (date_score * 0.20) + (name_score * 0.10);

  -- Bonus for very good amount match
  if amount_score >= 0.9 then
    overall_score := overall_score + 0.1;
  end if;

  -- Bonus for good name match
  if name_score >= 0.5 then
    overall_score := overall_score + 0.05;
  end if;

  return least(overall_score, 1);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_total_sum(target_currency text)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
    total_sum numeric := 0;
    currency_rate numeric;
    currency_sum record;
begin
    for currency_sum in
        select currency, sum(abs(amount)) as sum_amount
        from transactions
        group by currency
    loop
        select rate into currency_rate
        from exchange_rates
        where base = currency_sum.currency
          and target = target_currency
        limit 1;

        if currency_rate is null then
            raise notice 'no exchange rate found for currency % to target currency %', currency_sum.currency, target_currency;
            continue;
        end if;

        total_sum := total_sum + (currency_sum.sum_amount * currency_rate);
    end loop;

    return round(total_sum, 2);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_transaction_base_amount()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    team_base_currency text;
    exchange_rate numeric;
begin
    begin
        select base_currency into team_base_currency
        from teams
        where id = new.team_id;

        -- If the account currency is the same as the team's base currency or the team's base currency is null
        if new.currency = team_base_currency or team_base_currency is null then
            new.base_balance := new.balance;
            new.base_currency := new.currency;
        else
            select rate into exchange_rate
            from exchange_rates
            where base = new.currency
            and target = team_base_currency
            limit 1;

            if exchange_rate is null then
                raise exception 'Exchange rate not found for % to %', new.currency, team_base_currency;
            end if;

            new.base_balance := round(new.balance * exchange_rate, 2);
            new.base_currency := team_base_currency;
        end if;

        return new;
    exception
        when others then
            -- Log the error
            raise notice 'Error in calculate_bank_account_base_balance: %', sqlerrm;
            -- Return the original record without modification
            return new;
    end;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_transaction_differences(p_team_id uuid)
 RETURNS TABLE(transaction_group text, date date, team_id uuid, recurring boolean, frequency transaction_frequency, days_diff double precision)
 LANGUAGE plpgsql
AS $function$
begin
    return query
    select 
        gt.transaction_group,
        gt.date,
        gt.team_id,
        gt.recurring,
        gt.frequency,
        extract(epoch from (gt.date::timestamp - lag(gt.date::timestamp) over w))::float / (24 * 60 * 60) as days_diff
    from group_transactions(p_team_id) gt
    where gt.team_id = p_team_id -- Ensure filtering on team_id is done as early as possible
    window w as (partition by gt.transaction_group, gt.team_id order by gt.date);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_transaction_frequency(p_transaction_group text, p_team_id uuid, p_new_date date)
 RETURNS TABLE(avg_days_between double precision, transaction_count integer, is_recurring boolean, latest_frequency text)
 LANGUAGE plpgsql
AS $function$
declare
    v_avg_days_between float;
    v_transaction_count int;
    v_is_recurring boolean;
    v_latest_frequency text;
begin
    -- Optimize the query by avoiding subqueries and using more efficient aggregations
    select 
        coalesce(avg(extract(epoch from (p_new_date::timestamp - t.date::timestamp)) / (24 * 60 * 60)), 0),
        count(*) + 1,
        coalesce(bool_or(t.recurring), false),
        coalesce(max(case when t.recurring then t.frequency else null end), 'unknown')
    into v_avg_days_between, v_transaction_count, v_is_recurring, v_latest_frequency
    from transactions t
    where t.team_id = p_team_id
      and t.name in (p_transaction_group, identify_transaction_group(p_transaction_group, p_team_id))
      and t.date < p_new_date;

    return query select v_avg_days_between, v_transaction_count, v_is_recurring, v_latest_frequency;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculated_vat("public"."transactions") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
declare
    vat_rate numeric;
    vat_amount numeric;
begin
    if $1.category_slug is null then
        return 0;
    end if;

    select vat into vat_rate
        from transaction_categories as tc
        where $1.category_slug = tc.slug
        and $1.team_id = tc.team_id;

    vat_amount := $1.amount * (vat_rate / 100);

    return abs(round(vat_amount, 2));
end;
$$;

ALTER FUNCTION public.calculated_vat("public"."transactions") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.calculated_vat("public"."transactions") TO "anon";
GRANT ALL ON FUNCTION public.calculated_vat("public"."transactions") TO "authenticated";
GRANT ALL ON FUNCTION public.calculated_vat("public"."transactions") TO "service_role";

CREATE OR REPLACE FUNCTION public.classify_frequency(p_team_id uuid)
 RETURNS TABLE(transaction_group text, team_id uuid, transaction_count bigint, avg_days_between double precision, stddev_days_between double precision, frequency transaction_frequency)
 LANGUAGE plpgsql
AS $function$
begin
    return query
    select 
        td.transaction_group,
        td.team_id,
        count(*) as transaction_count,
        avg(td.days_diff) as avg_days_between,
        stddev(td.days_diff) as stddev_days_between,
        case 
            when bool_or(td.recurring) and max(td.frequency) != 'unknown' then max(td.frequency)
            when avg(td.days_diff) between 1 and 8 then 'weekly'::transaction_frequency
            when avg(td.days_diff) between 9 and 16 then 'biweekly'::transaction_frequency
            when avg(td.days_diff) between 18 and 40 then 'monthly'::transaction_frequency
            when avg(td.days_diff) between 60 and 80 then 'semi_monthly'::transaction_frequency
            when avg(td.days_diff) between 330 and 370 then 'annually'::transaction_frequency
            when count(*) < 2 then 'unknown'::transaction_frequency
            else 'irregular'::transaction_frequency
        end as frequency
    from calculate_transaction_differences_v2(p_team_id) td
    group by td.transaction_group, td.team_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_team("name" character varying) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
    new_team_id uuid;
begin
    insert into teams (name) values (name) returning id into new_team_id;
    insert into users_on_team (user_id, team_id, role) values (auth.uid(), new_team_id, 'owner');

    return new_team_id;
end;
$$;

ALTER FUNCTION public.create_team("name" character varying) OWNER TO "postgres";

GRANT ALL ON FUNCTION public.create_team("name" character varying) TO "anon";
GRANT ALL ON FUNCTION public.create_team("name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION public.create_team("name" character varying) TO "service_role";

CREATE OR REPLACE FUNCTION public.delete_from_documents()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM public.documents
    WHERE object_id = OLD.id;
    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.detect_recurring_transactions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    last_transaction record;
    days_diff numeric;
    frequency_type transaction_frequency;
    search_query text;
begin
    -- Wrap the entire function in a try-catch block
    begin
        -- Prepare the search query
        search_query := regexp_replace(
            regexp_replace(coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, ''), '[^\w\s]', ' ', 'g'),
            '\s+', ' ', 'g'
        );
        search_query := trim(search_query);
     
        -- Convert to tsquery format with prefix matching
        search_query := (
            SELECT string_agg(lexeme || ':*', ' & ')
            FROM unnest(string_to_array(search_query, ' ')) lexeme
            WHERE length(lexeme) > 0
        );
      
        -- Find the last similar transaction using ts_query
        SELECT * INTO last_transaction
        FROM transactions
        WHERE team_id = NEW.team_id
          AND id <> NEW.id -- exclude the current transaction
          AND date < NEW.date -- ensure we're looking at previous transactions
          AND category_slug != 'income' -- exclude income transactions
          AND category_slug != 'transfer' -- exclude transfer transactions
          AND fts_vector @@ to_tsquery('english', search_query)
        ORDER BY ts_rank(fts_vector, to_tsquery('english', search_query)) DESC, date DESC
        LIMIT 1;

        -- If at least one similar transaction exists, calculate frequency
        IF last_transaction.id IS NOT NULL THEN
            IF last_transaction.frequency IS NOT NULL AND last_transaction.recurring = true THEN
                frequency_type := last_transaction.frequency;
                -- Save recurring if last_transaction is true
                UPDATE transactions SET
                    recurring = true,
                    frequency = frequency_type
                WHERE id = NEW.id;
            ELSIF last_transaction.recurring = false THEN
                -- Set as non-recurring if last_transaction is false
                UPDATE transactions SET
                    recurring = false,
                    frequency = NULL
                WHERE id = NEW.id;
            ELSE
                days_diff := extract(epoch FROM (NEW.date::timestamp - last_transaction.date::timestamp)) / (24 * 60 * 60);
                
                CASE
                    WHEN days_diff BETWEEN 1 AND 16 THEN
                        frequency_type := 'weekly'::transaction_frequency;
                    WHEN days_diff BETWEEN 18 AND 80 THEN
                        frequency_type := 'monthly'::transaction_frequency;
                    WHEN days_diff BETWEEN 330 AND 370 THEN
                        frequency_type := 'annually'::transaction_frequency;
                    ELSE
                        frequency_type := 'irregular'::transaction_frequency;
                END CASE;

                -- Update the recurring flag and frequency only if not irregular
                IF frequency_type != 'irregular'::transaction_frequency THEN
                    UPDATE transactions SET
                        recurring = true,
                        frequency = frequency_type
                    WHERE id = NEW.id;
                ELSE
                    -- Mark as non-recurring if irregular
                    UPDATE transactions SET
                        recurring = false,
                        frequency = NULL
                    WHERE id = NEW.id;
                END IF;
            END IF;
        ELSE
            -- No similar transaction found, mark as non-recurring
            UPDATE transactions SET
                recurring = false,
                frequency = NULL
            WHERE id = NEW.id;
        END IF;

    exception
        when others then
            -- Log the error
            raise notice 'An error occurred: %', sqlerrm;
            
            -- Ensure we still return NEW even if an error occurs
            RETURN NEW;
    end;

    RETURN NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.determine_transaction_frequency(p_avg_days_between double precision, p_transaction_count integer, p_is_recurring boolean, p_latest_frequency text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
begin
    if p_is_recurring and p_latest_frequency != 'unknown' then
        return p_latest_frequency;
    else
        return case 
            when p_avg_days_between between 1 and 8 then 'weekly'
            when p_avg_days_between between 9 and 16 then 'biweekly'
            when p_avg_days_between between 18 and 40 then 'monthly'
            when p_avg_days_between between 60 and 80 then 'semi_monthly'
            when p_avg_days_between between 330 and 370 then 'annually'
            when p_transaction_count < 2 then 'unknown'
            else 'irregular'
        end;
    end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.extract_product_names("products_json" "json") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
begin
    return (
        select string_agg(value, ',') 
        from json_array_elements_text(products_json) as arr(value)
    );
end;
$$;

ALTER FUNCTION public.extract_product_names("products_json" json) OWNER TO "postgres";

GRANT ALL ON FUNCTION public.extract_product_names("products_json" "json") TO "anon";
GRANT ALL ON FUNCTION public.extract_product_names("products_json" json) TO "authenticated";
GRANT ALL ON FUNCTION public.extract_product_names("products_json" json) TO "service_role";

CREATE OR REPLACE FUNCTION public.find_matching_inbox_item(input_transaction_id uuid, specific_inbox_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(inbox_id uuid, transaction_id uuid, transaction_name text, similarity_score numeric, file_name text)
 LANGUAGE plpgsql
AS $function$
declare
  transaction_data record;
  inbox_data record;
  calculated_score numeric;
  similarity_threshold numeric := 0.90; -- Lowered threshold for more matches
begin
  -- Fetch transaction data
  select t.* 
  into transaction_data 
  from transactions t
  where t.id = input_transaction_id;

  if specific_inbox_id is not null then
    -- Check for a specific inbox item
    select * 
    into inbox_data 
    from inbox 
    where id = specific_inbox_id
      and team_id = transaction_data.team_id
      and status = 'pending';
    
    if inbox_data.id is not null then
      calculated_score := calculate_overall_similarity(transaction_data, inbox_data);
      
      if calculated_score >= similarity_threshold then
        return query select specific_inbox_id, input_transaction_id, transaction_data.name, calculated_score, inbox_data.file_name;
      end if;
    end if;
  else
    -- Find best matching inbox item
    return query
    select 
      i.id as inbox_id, 
      transaction_data.id as transaction_id, 
      transaction_data.name as transaction_name,
      calculate_overall_similarity(transaction_data, i.*) as similarity_score,
      i.file_name
    from inbox i
    where 
      i.team_id = transaction_data.team_id 
      and i.status = 'pending'
      and calculate_overall_similarity(transaction_data, i.*) >= similarity_threshold
    order by 
      calculate_overall_similarity(transaction_data, i.*) desc,
      abs(i.date - transaction_data.date) asc
    limit 1; -- Return only the best match
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_hmac("secret_key" "text", "message" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    hmac_result bytea;
BEGIN
    hmac_result := extensions.hmac(message::bytea, secret_key::bytea, 'sha256');
    RETURN encode(hmac_result, 'base64');
END;
$$;

ALTER FUNCTION public.generate_hmac("secret_key" text, "message" text) OWNER TO "postgres";

GRANT ALL ON FUNCTION public.generate_hmac("secret_key" "text", "message" "text") TO "anon";
GRANT ALL ON FUNCTION public.generate_hmac("secret_key" text, "message" text) TO "authenticated";
GRANT ALL ON FUNCTION public.generate_hmac("secret_key" text, "message" text) TO "service_role";

CREATE OR REPLACE FUNCTION public.generate_id("size" integer) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  bytes BYTEA := gen_random_bytes(size);
  l INT := length(characters);
  i INT := 0;
  output TEXT := '';
BEGIN
  WHILE i < size LOOP
    output := output || substr(characters, get_byte(bytes, i) % l + 1, 1);
    i := i + 1;
  END LOOP;
  RETURN lower(output);
END;
$$;

ALTER FUNCTION public.generate_id("size" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION public.generate_id("size" integer) TO "anon";
GRANT ALL ON FUNCTION public.generate_id("size" integer) TO "authenticated";
GRANT ALL ON FUNCTION public.generate_id("size" integer) TO "service_role";

CREATE OR REPLACE FUNCTION public.generate_inbox("size" integer) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  bytes BYTEA := extensions.gen_random_bytes(size);
  l INT := length(characters);
  i INT := 0;
  output TEXT := '';
BEGIN
  WHILE i < size LOOP
    output := output || substr(characters, get_byte(bytes, i) % l + 1, 1);
    i := i + 1;
  END LOOP;
  RETURN lower(output);
END;
$$;

ALTER FUNCTION public.generate_inbox("size" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION public.generate_inbox("size" integer) TO "anon";
GRANT ALL ON FUNCTION public.generate_inbox("size" integer) TO "authenticated";
GRANT ALL ON FUNCTION public.generate_inbox("size" integer) TO "service_role";

CREATE OR REPLACE FUNCTION public.generate_inbox_fts("display_name_text" "text", "product_names" "text", "amount" numeric, "due_date" "date") RETURNS "tsvector"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
begin
    return to_tsvector('english', coalesce(display_name_text, '') || ' ' || coalesce(product_names, '') || ' ' || coalesce(amount::text, '') || ' ' || due_date);
end;
$$;

ALTER FUNCTION public.generate_inbox_fts("display_name_text" "text", "product_names" "text", "amount" numeric, "due_date" "date") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.generate_inbox_fts("display_name_text" "text", "product_names" "text", "amount" numeric, "due_date" "date") TO "anon";
GRANT ALL ON FUNCTION public.generate_inbox_fts("display_name_text" "text", "product_names" "text", "amount" numeric, "due_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION public.generate_inbox_fts("display_name_text" "text", "product_names" "text", "amount" numeric, "due_date" "date") TO "service_role";

CREATE OR REPLACE FUNCTION public.generate_slug_from_name() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  if new.system is true then
    return new;
  end if;

  new.slug := public.slugify(new.name);
  return new;
end$$;

ALTER FUNCTION public.generate_slug_from_name() OWNER TO "postgres";

GRANT ALL ON FUNCTION public.generate_slug_from_name() TO "anon";
GRANT ALL ON FUNCTION public.generate_slug_from_name() TO "authenticated";
GRANT ALL ON FUNCTION public.generate_slug_from_name() TO "service_role";

CREATE OR REPLACE FUNCTION public.get_all_transactions_by_account(account_id uuid)
 RETURNS SETOF transactions
 LANGUAGE sql
AS $function$
  select * from transactions where bank_account_id = $1;
$function$
;

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

CREATE OR REPLACE FUNCTION public.get_bank_account_currencies("team_id" "uuid") RETURNS TABLE("currency" "text")
    LANGUAGE "plpgsql"
    AS $$
begin
  return query select distinct bank_accounts.currency from bank_accounts where bank_accounts.team_id = get_bank_account_currencies.team_id order by bank_accounts.currency;
end;
$$;

ALTER FUNCTION public.get_bank_account_currencies("team_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.get_bank_account_currencies("team_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION public.get_bank_account_currencies("team_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION public.get_bank_account_currencies("team_id" "uuid") TO "service_role";

CREATE OR REPLACE FUNCTION public.get_burn_rate(team_id uuid, date_from date, date_to date, base_currency text DEFAULT NULL::text)
 RETURNS TABLE(date timestamp with time zone, value numeric, currency text)
 LANGUAGE plpgsql
AS $function$
declare
    target_currency text;
begin
    if get_burn_rate_v3.base_currency is not null then
        target_currency := get_burn_rate_v3.base_currency;
    else
        select teams.base_currency into target_currency
        from teams
        where teams.id = get_burn_rate_v3.team_id;
    end if;

  return query
    select
      date_trunc('month', month_series) as date,
      coalesce(abs(sum(
        case
          when get_burn_rate_v3.base_currency is not null then t.amount
          else t.base_amount
        end
      )), 0) as value,
      target_currency as currency
    from
      generate_series(
        date_trunc('month', date_from),
        date_trunc('month', date_to),
        interval '1 month'
      ) as month_series
      left join transactions as t
        on date_trunc('month', t.date) = date_trunc('month', month_series)
        and t.team_id = get_burn_rate_v3.team_id
        and t.category_slug != 'transfer'
        and t.status = 'posted'
        and (
          case
            when get_burn_rate_v3.base_currency is not null then t.amount
            else t.base_amount
          end
        ) < 0
        and (
          (get_burn_rate_v3.base_currency is not null and t.currency = target_currency) or
          (get_burn_rate_v3.base_currency is null and t.base_currency = target_currency)
        )
    group by
      date_trunc('month', month_series)
    order by
      date_trunc('month', month_series) asc;
end;
$function$
;

ALTER FUNCTION "public"."get_burn_rate"("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.get_burn_rate("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "anon";
GRANT ALL ON FUNCTION public.get_burn_rate("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "authenticated";
GRANT ALL ON FUNCTION public.get_burn_rate("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "service_role";

CREATE OR REPLACE FUNCTION public.get_current_burn_rate(team_id uuid, base_currency text DEFAULT NULL::text)
 RETURNS TABLE(currency text, value numeric)
 LANGUAGE plpgsql
AS $function$
declare
  current_burn_rate numeric;
  target_currency text;
begin
    if get_current_burn_rate_v3.base_currency is not null then
        target_currency := get_current_burn_rate_v3.base_currency;
    else
        select teams.base_currency into target_currency
        from teams
        where teams.id = get_current_burn_rate_v3.team_id;
    end if;
  
  select
    coalesce(abs(sum(
        case
          when get_current_burn_rate_v3.base_currency is not null then t.amount
          else t.base_amount
        end
      )), 0) into current_burn_rate
  from
    transactions as t
  where
    date_trunc('month', t.date) = date_trunc('month', current_date)
    and t.team_id = get_current_burn_rate_v3.team_id
    and t.category_slug != 'transfer'
    and t.status = 'posted'
    and (
      (get_current_burn_rate_v3.base_currency is not null and t.currency = target_currency) or
      (get_current_burn_rate_v3.base_currency is null and t.base_currency = target_currency)
    )
    and (
          case
            when get_current_burn_rate_v3.base_currency is not null then t.amount
            else t.base_amount
          end
        ) < 0;

  return query
    select
      target_currency as currency,
      current_burn_rate as value;
end;
$function$
;

ALTER FUNCTION public.get_current_burn_rate("team_id" "uuid", "currency" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.get_current_burn_rate("team_id" "uuid", "currency" "text") TO "anon";
GRANT ALL ON FUNCTION public.get_current_burn_rate("team_id" "uuid", "currency" "text") TO "authenticated";
GRANT ALL ON FUNCTION public.get_current_burn_rate("team_id" "uuid", "currency" "text") TO "service_role";

CREATE OR REPLACE FUNCTION public.get_current_user_team_id()
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN (SELECT team_id FROM users WHERE id = (SELECT auth.uid()));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_expenses(team_id uuid, date_from date, date_to date, base_currency text DEFAULT NULL::text)
 RETURNS TABLE(date timestamp without time zone, value numeric, recurring_value numeric, currency text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    target_currency text;
BEGIN
    IF base_currency IS NOT NULL THEN
        target_currency := base_currency;
    ELSE
        SELECT teams.base_currency INTO target_currency
        FROM teams
        WHERE teams.id = team_id;
    END IF;

    RETURN QUERY
    SELECT
        date_trunc('month', month_series)::timestamp without time zone AS date,
        COALESCE(SUM(
            CASE
                WHEN get_expenses.base_currency IS NOT NULL AND (t.recurring = false OR t.recurring IS NULL) THEN abs(t.amount)
                WHEN get_expenses.base_currency IS NULL AND (t.recurring = false OR t.recurring IS NULL) THEN abs(t.base_amount)
                ELSE 0
            END
        ), 0) AS value,
        COALESCE(SUM(
            CASE
                WHEN get_expenses.base_currency IS NOT NULL AND t.recurring = true THEN abs(t.amount)
                WHEN get_expenses.base_currency IS NULL AND t.recurring = true THEN abs(t.base_amount)
                ELSE 0
            END
        ), 0) AS recurring_value,
        target_currency AS currency
    FROM
        generate_series(
            date_from::date,
            date_to::date,
            interval '1 month'
        ) AS month_series
    LEFT JOIN transactions AS t ON date_trunc('month', t.date) = date_trunc('month', month_series)
        AND t.team_id = get_expenses.team_id
        AND (t.category_slug IS NULL OR t.category_slug != 'transfer')
        AND t.status = 'posted'
        AND (
            (get_expenses.base_currency IS NOT NULL AND t.currency = target_currency AND t.amount < 0) OR
            (get_expenses.base_currency IS NULL AND t.base_currency = target_currency AND t.base_amount < 0)
        )
    GROUP BY
        date_trunc('month', month_series)
    ORDER BY
        date_trunc('month', month_series);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_profit(team_id uuid, date_from date, date_to date, base_currency text DEFAULT NULL::text)
 RETURNS TABLE(date timestamp with time zone, value numeric, currency text)
 LANGUAGE plpgsql
AS $function$
declare
    target_currency text;
begin
    if get_profit.base_currency is not null then
        target_currency := get_profit.base_currency;
    else
        select teams.base_currency into target_currency
        from teams
        where teams.id = get_profit.team_id;
    end if;

  return query
    select
      date_trunc('month', month_series) as date,
      coalesce(sum(
        case
          when get_profit.base_currency is not null then t.amount
          else t.base_amount
        end
      ), 0) as value,
      target_currency as currency
    from
      generate_series(
        date_from::date,
        date_to::date,
        interval '1 month'
      ) as month_series
    left join transactions as t on date_trunc('month', t.date) = date_trunc('month', month_series)
      and t.team_id = get_profit.team_id
      and t.category_slug != 'transfer'
      and t.status = 'posted'
      and (
        (get_profit.base_currency is not null and t.currency = target_currency) or
        (get_profit.base_currency is null and t.base_currency = target_currency)
      )
    group by
      date_trunc('month', month_series)
    order by
      date_trunc('month', month_series);
end;
$function$
;

ALTER FUNCTION "public"."get_profit"("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.get_profit("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "anon";
GRANT ALL ON FUNCTION public.get_profit("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "authenticated";
GRANT ALL ON FUNCTION public.get_profit("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "service_role";

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

CREATE OR REPLACE FUNCTION public.get_revenue(team_id uuid, date_from date, date_to date, base_currency text DEFAULT NULL::text)
 RETURNS TABLE(date timestamp with time zone, value numeric, currency text)
 LANGUAGE plpgsql
AS $function$
declare
    target_currency text;
begin
    if get_revenue.base_currency is not null then
        target_currency := get_revenue.base_currency;
    else
        select teams.base_currency into target_currency
        from teams
        where teams.id = get_revenue.team_id;
    end if;
  return query
    select
      date_trunc('month', month_series) as date,
      coalesce(sum(
        case
          when get_revenue.base_currency is not null then t.amount
          else t.base_amount
        end
      ), 0) as value,
      target_currency as currency
    from
      generate_series(
        date_from::date,
        date_to::date,
        interval '1 month'
      ) as month_series
      left join transactions as t on date_trunc('month', t.date) = date_trunc('month', month_series)
      and t.team_id = get_revenue.team_id
      and t.category_slug != 'transfer'
      and t.category_slug = 'income'
      and t.status = 'posted'
      and (
        (get_revenue.base_currency is not null and t.currency = target_currency) or
        (get_revenue.base_currency is null and t.base_currency = target_currency)
      )
    group by
      date_trunc('month', month_series)
    order by
      date_trunc('month', month_series);
end;
$function$
;

ALTER FUNCTION public.get_revenue("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.get_revenue("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "anon";
GRANT ALL ON FUNCTION public.get_revenue("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "authenticated";
GRANT ALL ON FUNCTION public.get_revenue("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "service_role";

CREATE OR REPLACE FUNCTION public.get_runway(team_id text, date_from date, date_to date, base_currency text DEFAULT NULL::text)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
    target_currency text;
    total_balance numeric;
    avg_burn_rate numeric;
    number_of_months numeric;
begin
    if get_runway_v4.base_currency is not null then
        target_currency := get_runway_v4.base_currency;
    else
        select teams.base_currency into target_currency
        from teams
        where teams.id = get_runway_v4.team_id;
    end if;

    select * from get_total_balance(team_id, target_currency) into total_balance;
    
    select (extract(year FROM date_to) - extract(year FROM date_from)) * 12 +
           extract(month FROM date_to) - extract(month FROM date_from) 
    into number_of_months;
    
    select round(avg(value)) 
    from get_burn_rate_v3(team_id, date_from, date_to, target_currency) 
    into avg_burn_rate;

    if avg_burn_rate = 0 then
        return null;
    else
        return round(total_balance / avg_burn_rate);
    end if;
end;
$function$
;

ALTER FUNCTION public.get_runway("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.get_runway("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "anon";
GRANT ALL ON FUNCTION public.get_runway("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "authenticated";
GRANT ALL ON FUNCTION public.get_runway("team_id" "uuid", "date_from" "date", "date_to" "date", "currency" "text") TO "service_role";

CREATE OR REPLACE FUNCTION public.get_spending(team_id uuid, date_from date, date_to date, base_currency text DEFAULT NULL::text)
 RETURNS TABLE(name text, slug text, amount numeric, currency text, color text, percentage numeric)
 LANGUAGE plpgsql
AS $function$

declare
    target_currency text;
    total_amount numeric;
begin
    if get_spending.base_currency is not null then
        target_currency := get_spending.base_currency;
    else
        select teams.base_currency into target_currency
        from teams
        where teams.id = get_spending.team_id;
    end if;

    select sum(case
            when get_spending.base_currency is not null then t.amount
            else t.base_amount
        end) into total_amount
    from transactions as t
    where t.team_id = get_spending.team_id
        and t.category_slug != 'transfer'
        and (t.base_currency = target_currency or t.currency = target_currency)
        and t.date >= date_from
        and t.date <= date_to
        and t.base_amount < 0;

    return query
    select 
        coalesce(category.name, 'Uncategorized') AS name,
        coalesce(category.slug, 'uncategorized') as slug,
        sum(case
            when get_spending.base_currency is not null then t.amount
            else t.base_amount
        end) as amount,
        target_currency as currency,
        coalesce(category.color, '#606060') as color,
        case 
            when ((sum(case
                when get_spending.base_currency is not null then t.amount
                else t.base_amount
            end) / total_amount) * 100) > 1 then
                round((sum(case
                    when get_spending.base_currency is not null then t.amount
                    else t.base_amount
                end) / total_amount) * 100)
            else
                round((sum(case
                    when get_spending.base_currency is not null then t.amount
                    else t.base_amount
                end) / total_amount) * 100, 2)
        end as percentage
    from 
        transactions as t
    left join
        transaction_categories as category on t.team_id = category.team_id and t.category_slug = category.slug
    where 
        t.team_id = get_spending.team_id
        and t.category_slug != 'transfer'
        and (t.base_currency = target_currency or t.currency = target_currency)
        and t.date >= date_from
        and t.date <= date_to
        and t.base_amount < 0
    group by
        category.name,
        coalesce(category.slug, 'uncategorized'),
        category.color
    order by
        sum(case
            when get_spending.base_currency is not null then t.amount
            else t.base_amount
        end) asc;
end;
$function$
;

ALTER FUNCTION public.get_spending("team_id" "uuid", "date_from" "date", "date_to" "date", "currency_target" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.get_spending("team_id" "uuid", "date_from" "date", "date_to" "date", "currency_target" "text") TO "anon";
GRANT ALL ON FUNCTION public.get_spending("team_id" "uuid", "date_from" "date", "date_to" "date", "currency_target" "text") TO "authenticated";
GRANT ALL ON FUNCTION public.get_spending("team_id" "uuid", "date_from" "date", "date_to" "date", "currency_target" "text") TO "service_role";

CREATE OR REPLACE FUNCTION public.get_total_balance(team_id uuid, currency text)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
declare
    total_balance numeric;
begin
    select coalesce(sum(abs(case when b.base_currency = get_total_balance.currency then base_balance else balance end)), 0) into total_balance
    from bank_accounts as b
    where enabled = true
        and b.team_id = get_total_balance.team_id
        and (b.base_currency = get_total_balance.currency or b.currency = get_total_balance.currency);

    return total_balance;
end;
$function$
;

ALTER FUNCTION public.get_total_balanc("team_id" "uuid", "currency" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.get_total_balance("team_id" "uuid", "currency" "text") TO "anon";
GRANT ALL ON FUNCTION public.get_total_balance("team_id" "uuid", "currency" "text") TO "authenticated";
GRANT ALL ON FUNCTION public.get_total_balance("team_id" "uuid", "currency" "text") TO "service_role";

GRANT ALL ON FUNCTION public.gin_extract_query_trgm("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION public.gin_extract_query_trgm("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION public.gin_extract_query_trgm("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gin_extract_query_trgm("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";

GRANT ALL ON FUNCTION public.gin_extract_value_trgm("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION public.gin_extract_value_trgm("text", "internal") TO "anon";
GRANT ALL ON FUNCTION public.gin_extract_value_trgm("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gin_extract_value_trgm("text", "internal") TO "service_role";

GRANT ALL ON FUNCTION public.gin_trgm_consistent("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION public.gin_trgm_consistent("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION public.gin_trgm_consistent("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gin_trgm_consistent("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";

GRANT ALL ON FUNCTION public.gin_trgm_triconsistent("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION public.gin_trgm_triconsistent("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION public.gin_trgm_triconsistent("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gin_trgm_triconsistent("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";

CREATE OR REPLACE FUNCTION public.group_transactions(p_team_id uuid)
 RETURNS TABLE(transaction_group text, date date, team_id uuid, recurring boolean, frequency transaction_frequency)
 LANGUAGE plpgsql
AS $function$
begin
    return query
    select 
        coalesce(st.similar_transaction_name, t.name) as transaction_group,
        t.date,
        t.team_id,
        t.recurring,
        t.frequency
    from transactions t
    left join identify_similar_transactions(p_team_id) st
    on t.name = st.original_transaction_name
    where t.team_id = p_team_id;
end;
$function$
;

GRANT ALL ON FUNCTION public.gtrgm_compress("internal") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_compress("internal") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_compress("internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_compress("internal") TO "service_role";

GRANT ALL ON FUNCTION public.gtrgm_consistent("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_consistent("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_consistent("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_consistent("internal", "text", smallint, "oid", "internal") TO "service_role";

GRANT ALL ON FUNCTION public.gtrgm_decompress("internal") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_decompress("internal") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_decompress("internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_decompress("internal") TO "service_role";

GRANT ALL ON FUNCTION public.gtrgm_distance("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_distance("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_distance("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_distance("internal", "text", smallint, "oid", "internal") TO "service_role";

GRANT ALL ON FUNCTION public.gtrgm_in("cstring") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_in("cstring") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_in("cstring") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_in("cstring") TO "service_role";

GRANT ALL ON FUNCTION public.gtrgm_options("internal") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_options("internal") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_options("internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_options("internal") TO "service_role";

GRANT ALL ON FUNCTION public.gtrgm_out("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_out("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_out("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_out("public"."gtrgm") TO "service_role";

GRANT ALL ON FUNCTION public.gtrgm_penalty("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_penalty("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_penalty("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_penalty("internal", "internal", "internal") TO "service_role";

GRANT ALL ON FUNCTION public.gtrgm_picksplit("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_picksplit("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_picksplit("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_picksplit("internal", "internal") TO "service_role";

GRANT ALL ON FUNCTION public.gtrgm_same("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_same("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_same("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_same("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";

GRANT ALL ON FUNCTION public.gtrgm_union("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION public.gtrgm_union("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION public.gtrgm_union("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION public.gtrgm_union("internal", "internal") TO "service_role";

CREATE OR REPLACE FUNCTION public.handle_empty_folder_placeholder()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Check if the name does not end with '.folderPlaceholder'
    IF NEW.bucket_id = 'vault' AND NEW.name NOT LIKE '%/.folderPlaceholder' THEN

        -- Create a modified name with '.folderPlaceholder' at the end
        DECLARE
            modified_name TEXT;
        BEGIN
            modified_name := regexp_replace(NEW.name, '([^/]+)$', '.folderPlaceholder');

            -- Check if the modified name already exists in the table
            IF NOT EXISTS (
                SELECT 1 
                FROM storage.objects 
                WHERE bucket_id = NEW.bucket_id 
                AND name = modified_name
            ) THEN
                -- Insert the new row with the modified name
                INSERT INTO storage.objects (
                    bucket_id, 
                    name, 
                    owner, 
                    owner_id, 
                    team_id, 
                    parent_path, 
                    depth
                )
                VALUES (
                    NEW.bucket_id, 
                    modified_name, 
                    NEW.owner, 
                    NEW.owner_id, 
                    NEW.team_id, 
                    NEW.parent_path, 
                    NEW.depth
                );
            END IF;
        END;
    END IF;

    -- Allow the original row to be inserted without modifying NEW.name
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION storage.handle_empty_folder_placeholder()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    name_tokens text[];
    modified_name text;
BEGIN
    -- Split the name into an array of tokens based on '/'
    name_tokens := string_to_array(NEW.name, '/');

    -- Check if the last item in name_tokens is '.emptyFolderPlaceholder'
    IF name_tokens[array_length(name_tokens, 1)] = '.emptyFolderPlaceholder' THEN
        
        -- Change the last item to '.folderPlaceholder'
        name_tokens[array_length(name_tokens, 1)] := '.folderPlaceholder';
        
        -- Reassemble the tokens back into a string
        modified_name := array_to_string(name_tokens, '/');

        -- Insert a new row with the modified name
        INSERT INTO storage.objects (bucket_id, name, owner, owner_id, team_id, parent_path)
        VALUES (
            NEW.bucket_id,
            modified_name,
            NEW.owner,
            NEW.owner_id,
            NEW.team_id,
            NEW.parent_path
        );
    END IF;

    -- Insert the original row
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$begin
  insert into public.users (
    id,
    full_name,
    avatar_url,
    email
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );

  return new;
end;$function$
;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.identify_similar_transactions(p_team_id uuid)
 RETURNS TABLE(original_transaction_name text, similar_transaction_name text, team_id uuid)
 LANGUAGE plpgsql
AS $function$
begin
    return query
    select 
        t1.name as original_transaction_name,
        t2.name as similar_transaction_name,
        t1.team_id
    from transactions t1
    join transactions t2 on t1.team_id = t2.team_id
    where t1.team_id = p_team_id
      and t1.name <> t2.name
      and similarity(t1.name, t2.name) > 0.8
      and t1.name ILIKE t2.name || '%'; -- Example of limiting comparisons
end;
$function$
;

CREATE OR REPLACE FUNCTION public.identify_transaction_group(p_name text, p_team_id uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
declare
    v_transaction_group text;
begin
    -- Use a more efficient similarity check with trigram index and lateral join
    -- Add a LIMIT clause to prevent excessive processing
    select coalesce(similar_name, p_name) into v_transaction_group
    from (
        select p_name as original_name
    ) as original
    left join lateral (
        select t.name as similar_name
        from transactions t
        where t.team_id = p_team_id
          and t.name <> p_name
          and similarity(t.name, p_name) > 0.8  -- Use similarity function with a threshold
        order by similarity(t.name, p_name) desc
    ) as similar_transactions on true;

    return v_transaction_group;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.inbox_amount_text("public"."inbox") RETURNS "text"
    LANGUAGE "sql"
    AS $_$
  select ABS($1.amount)::text;
$_$;

ALTER FUNCTION public.inbox_amount_text("public"."inbox") OWNER TO "postgres";

GRANT ALL ON FUNCTION public.inbox_amount_text("public"."inbox") TO "anon";
GRANT ALL ON FUNCTION public.inbox_amount_text("public"."inbox") TO "authenticated";
GRANT ALL ON FUNCTION public.inbox_amount_text("public"."inbox") TO "service_role";

CREATE OR REPLACE FUNCTION public.insert_into_documents()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    modified_name TEXT;
    team_id UUID;
    parent_id TEXT;
BEGIN
    team_id := NEW.path_tokens[1];

    BEGIN
        -- Extract parent_id from path_tokens
        IF array_length(NEW.path_tokens, 1) > 1 THEN
            IF NEW.path_tokens[array_length(NEW.path_tokens, 1)] = '.emptyFolderPlaceholder' THEN
                -- If the last token is '.folderPlaceholder', take the second to last token
                parent_id := NEW.path_tokens[array_length(NEW.path_tokens, 1) - 2];
            ELSE
                -- Otherwise, take the last token
                parent_id := NEW.path_tokens[array_length(NEW.path_tokens, 1) - 1];
            END IF;
        ELSE
            -- If there's only one token, set parent_id to null
            parent_id := null;
        END IF;
    END;

    IF NOT NEW.name LIKE '%.emptyFolderPlaceholder' THEN
        INSERT INTO documents (
            id,
            name,
            created_at,
            metadata,
            path_tokens,
            team_id,
            parent_id,
            object_id,
            owner_id
        )
        VALUES (
            NEW.id,
            NEW.name,
            NEW.created_at,
            NEW.metadata,
            NEW.path_tokens,
            team_id,
            parent_id,
            NEW.id,
            NEW.owner_id::uuid
        );
    END IF;

    BEGIN
        IF array_length(NEW.path_tokens, 1) > 2 AND parent_id NOT IN ('inbox', 'transactions', 'exports', 'imports') THEN
            -- Create a modified name with '.folderPlaceholder' at the end
            modified_name := regexp_replace(NEW.name, '([^/]+)$', '.folderPlaceholder');
            
            -- Check if the modified name already exists in the table
            IF NOT EXISTS (
                SELECT 1 
                FROM documents 
                WHERE name = modified_name
            ) THEN
                -- Insert the new row with the modified name
                INSERT INTO documents (
                    name, 
                    team_id,
                    path_tokens,
                    parent_id,
                    object_id
                )
                VALUES (
                    modified_name, 
                    team_id, 
                    string_to_array(modified_name, '/'),
                    parent_id,
                    NEW.id
                );
            END IF;
        END IF;
    END;

    RETURN NEW;
END;
$function$
;

CREATE TRIGGER after_insert_objects AFTER INSERT ON storage.objects FOR EACH ROW WHEN ((new.bucket_id = 'vault'::text)) EXECUTE FUNCTION insert_into_documents();

CREATE OR REPLACE FUNCTION "public"."insert_system_categories"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$begin
  insert into public.transaction_categories (name, team_id, color, slug, system, embedding)
  values
    ('Flights', new.id, '#abdd1d', 'flight', true, array[0.014789561741054058,-0.002656542928889394,0.059730164706707,-0.025741375982761383,0.005148091819137335,0.03349106386303902,0.07846752554178238,0.03239711746573448,-0.04226863011717796,-0.019586680456995964,-0.01032069232314825,-0.047265369445085526,0.02405109442770481,0.05976157262921333,0.010248729027807713,-0.005363388918340206,-0.005425749812275171,-0.009911027736961842,-0.0509972870349884,-0.005863883998245001,0.018211951479315758,-0.028684228658676147,-0.015670131891965866,-0.04524487257003784,0.03870223090052605,0.030623584985733032,-0.010679751634597778,-0.01768946461379528,-0.06770598888397217,-0.1268979012966156,-0.015839958563447,-0.06624870747327805,-0.012326289899647236,-0.03984001651406288,-0.04398493468761444,-0.03162575885653496,0.011961325071752071,0.03574452921748161,-0.026658983901143074,0.04015965387225151,0.07415992021560669,0.017952939495444298,-0.015210664831101894,-0.07159902900457382,-0.0301414355635643,-0.0173793938010931,-0.013249515555799007,-0.011197995394468307,0.05605444312095642,-0.055877551436424255,0.037876274436712265,-0.021018946543335915,0.017953453585505486,0.00862615555524826,0.00868828035891056,0.04807009920477867,0.032608360052108765,0.031088216230273247,0.04616282507777214,0.013334018178284168,0.02182369865477085,0.05478975549340248,-0.23732039332389832,0.10073814541101456,0.024430207908153534,0.026288911700248718,-0.047357089817523956,0.012528648599982262,0.02709384635090828,0.008075526915490627,-0.02202317677438259,0.05018104240298271,-0.007809648290276527,0.09677111357450485,0.04725485295057297,-0.0287160687148571,-0.00025389576330780983,-0.005808812100440264,-0.015277464874088764,0.013725928030908108,0.028033729642629623,-0.051082152873277664,-0.0018847368191927671,0.007874179631471634,0.02524220384657383,-0.05623246729373932,-0.027888290584087372,-0.05932224541902542,0.026229310780763626,-0.008817984722554684,-0.018041588366031647,-0.04703105241060257,-0.02061035856604576,0.045977454632520676,-0.06489615887403488,-0.02941157855093479,0.009876735508441925,-0.0010272234212607145,-0.008398732170462608,0.2635882496833801,-0.05918406322598457,0.06406421214342117,0.039604611694812775,0.01805088110268116,-0.04122351109981537,-0.04615747928619385,-0.006425259634852409,-0.016622347757220268,-0.046717964112758636,-0.0009010591893456876,-0.02850426733493805,-0.03445251286029816,0.02880864217877388,-0.03543045371770859,-0.0029058479703962803,0.0306731928139925,0.06598177552223206,0.057762712240219116,-0.057257797569036484,-0.01777218095958233,-0.02861289493739605,-0.0024556354619562626,0.03894802927970886,-0.03285834193229675,-0.0032461765222251415,-0.11732117831707001,0.05810137838125229,0.1341060996055603,0.021236279979348183,0.02720421552658081,0.048741839826107025,-0.009599841199815273,-0.06903841346502304,0.028507249429821968,-0.02117953449487686,-0.00255607976578176,0.02993885427713394,-0.04077291116118431,0.03705935925245285,-0.007336068898439407,-0.03715139627456665,-0.06665199249982834,-0.0008832854800857604,-0.1408444195985794,-0.03542010858654976,0.04630028083920479,0.01473926566541195,0.03293810784816742,-0.04572951793670654,0.0027039714623242617,-0.006481094751507044,0.017748717218637466,-0.012113692238926888,-0.03357858210802078,0.0023315055295825005,0.038248635828495026,0.04947655647993088,0.027702847495675087,-0.03591053932905197,0.032744839787483215,-0.037911880761384964,-0.07717686146497726,-0.04972169175744057,0.11008060723543167,-0.0201900452375412,-0.08335323631763458,0.0004906923277303576,0.0402064211666584,-0.006451285909861326,-0.04363134875893593,0.015071027912199497,0.023703306913375854,-0.05443112552165985,0.0316493958234787,0.08662211149930954,0.02547437511384487,-0.031942445784807205,0.03599072992801666,-0.01792805828154087,-0.028751475736498833,0.01988435536623001,-0.023907514289021492,-0.05221124738454819,0.051718536764383316,0.061880774796009064,-0.035545699298381805,-0.01871666871011257,-0.03319709002971649,0.031860705465078354,0.037737760692834854,0.04688147082924843,0.004273661877959967,0.010067266412079334,-0.046436503529548645,-0.020739203318953514,-0.0277866218239069,-0.028661813586950302,-0.022213082760572433,0.049115054309368134,-0.04065369442105293,0.004691347945481539,-0.021067414432764053,-0.020797807723283768,0.013616529293358326,0.029443349689245224,-0.011701386421918869,-0.017195509746670723,-0.02114950306713581,-0.022912735119462013,0.03220141679048538,0.0017284973291680217,0.02608741633594036,0.08546420931816101,-0.025521567091345787,-0.03218994662165642,-0.004966947250068188,0.045581020414829254,0.03565012663602829,-0.005959560163319111,0.029883146286010742,0.038537319749593735,-0.12093909084796906,-0.02477363497018814,-0.2184862494468689,0.0048062861897051334,-0.004047975409775972,-0.005797299090772867,0.0465516597032547,-0.03541848808526993,0.006456303410232067,-0.02497640624642372,0.05600824952125549,0.04950837045907974,0.05758282542228699,-0.0398247055709362,-0.013674070127308369,0.08330831676721573,-0.018963882699608803,0.04312790185213089,0.002612612210214138,0.05701228603720665,-0.01682918332517147,-0.005479814484715462,0.002953633200377226,0.030584290623664856,-0.026138927787542343,-0.08814044296741486,0.022313600406050682,-0.012044833973050117,0.22665464878082275,0.0076027559116482735,0.010815099813044071,-0.05752404406666756,0.041518572717905045,-0.0032604660373181105,0.04057236760854721,-0.11464865505695343,0.0108933812007308,0.028277330100536346,0.10774607211351395,-0.03565417602658272,-0.028851501643657684,-0.031236352398991585,0.011422672308981419,0.05999588593840599,-0.0074312700890004635,-0.02138115093111992,-0.014039411209523678,-0.018437599763274193,-0.017728928476572037,-0.010555124841630459,-0.01418386586010456,0.005332768429070711,0.03770853206515312,-0.04493290185928345,0.02689475752413273,0.0013541670050472021,-0.006291169673204422,-0.03242715448141098,-0.057367946952581406,-0.00142085540574044,-0.06727977097034454,0.08020462095737457,-0.021240562200546265,-0.05121079087257385,0.023103982210159302,-0.0008905623108148575,0.056649431586265564,0.021511955186724663,-0.046393461525440216,-0.015921197831630707,0.01467752642929554,-0.04742361605167389,-0.056505296379327774,0.10663127154111862,-0.02284705638885498,-0.04338731989264488,0.0992531031370163,-0.0020637260749936104,0.062178004533052444,0.052020419389009476,0.004159511998295784,-0.02291460707783699,0.0554748959839344,-0.04986298084259033,0.027232464402914047,0.024082891643047333,0.010330524295568466,0.021190350875258446,0.05190087854862213,-0.036369722336530685,-0.013088827952742577,-0.04845460504293442,-0.028116025030612946,-0.020151467993855476,-0.0077372887171804905,-0.04803735762834549,-0.0038116758223623037,-0.005622731056064367,-0.2768062949180603,0.035170767456293106,0.008721682243049145,0.005860576871782541,-0.03505948558449745,0.027773460373282433,0.04671623557806015,0.06631679832935333,-0.014092962257564068,0.016493789851665497,0.07791746407747269,-0.013909691013395786,0.05900907143950462,0.02189597114920616,0.019383538514375687,0.07025164365768433,0.06606920063495636,-0.028689583763480186,0.026311105117201805,-0.026743946596980095,0.006058140657842159,0.0584513396024704,0.22175152599811554,-0.008800235576927662,0.0171325895935297,0.006553944665938616,-0.020204635336995125,0.030660662800073624,-0.017084302380681038,0.006564174313098192,0.011326435022056103,-0.0053792912513017654,0.07490716874599457,-0.05503547191619873,0.027575833722949028,0.031140055507421494,-0.06216276437044144,0.03695747256278992,-0.015924984589219093,-0.05155354365706444,-0.05920166149735451,0.06554380804300308,0.0016147507121786475,-0.031047027558088303,0.09191016107797623,-0.0483306460082531,-0.04183190315961838,-0.0424591600894928,0.015921974554657936,0.03847784548997879,0.001908636186271906,0.020571328699588776,-0.026800857856869698,0.004937534220516682,0.07205968350172043,0.007313959766179323,-0.03470170497894287,-0.04549286887049675,-0.026034586131572723,-0.019444474950432777,0.01615981012582779,-0.0552629716694355,-0.0729145035147667,-0.019163642078638077,0.02738776244223118]),
    ('Stays', new.id, '#bb4647', 'stay', true, array[-0.038325365632772446,-0.01769847422838211,0.06828249245882034,-0.040497906506061554,0.04374952241778374,0.030301164835691452,0.0415036678314209,0.05874503403902054,-0.010983149521052837,0.007388439029455185,-0.0017847397830337286,-0.03563510254025459,0.05448518693447113,0.01644933968782425,-0.006760952528566122,-0.03054066374897957,0.0033516231924295425,-0.03587816655635834,-0.036675333976745605,0.05620826408267021,0.01602162979543209,-0.03471849858760834,-0.07298161834478378,-0.04817330092191696,0.022512270137667656,0.04007957875728607,-0.043679170310497284,-0.0027850663755089045,-0.02391132526099682,-0.1665041446685791,-0.03927622362971306,-0.05886474624276161,0.027151839807629585,0.005262123886495829,0.06578207015991211,-0.006926087662577629,-0.0025641927495598793,0.037427373230457306,-0.031802885234355927,0.03721112012863159,0.02017948217689991,-0.028119798749685287,-0.01383375097066164,-0.039005350321531296,-0.03065531700849533,-0.03305509686470032,0.004593439865857363,-0.01368757151067257,0.06302259862422943,-0.0062675634399056435,0.0545135959982872,-0.025032199919223785,0.00012918357970193028,0.028437970206141472,-0.020994536578655243,-0.007593686692416668,0.03411738574504852,0.01709427498281002,0.020792048424482346,0.04581446945667267,0.024058861657977104,0.014882124960422516,-0.2126093953847885,0.08831971138715744,0.007829436101019382,-0.02197341062128544,-0.060013558715581894,0.011105231940746307,-0.012230007909238338,0.05218665674328804,-0.04996715113520622,0.0036843926645815372,0.007313981186598539,0.04082062095403671,0.05085831135511398,-0.004242748487740755,-0.018443897366523743,-0.03407977521419525,0.005785726476460695,0.0075283776968717575,-0.02347683720290661,-0.00749147217720747,-0.011572971008718014,0.009155794978141785,-0.06712204962968826,-0.02224397286772728,0.014388958923518658,-0.038880739361047745,0.060004040598869324,-0.028820034116506577,-0.041797976940870285,0.024344421923160553,-0.0488443560898304,-0.030302679166197777,-0.08009298145771027,-0.07955391705036163,0.02929229475557804,0.039265844970941544,-0.059235673397779465,0.2577892243862152,-0.0684317946434021,-0.011343427933752537,0.09288869053125381,-0.0804683044552803,-0.009277847595512867,-0.06314338743686676,0.0025743397418409586,-0.021339088678359985,-0.04034857079386711,0.03310848027467728,0.0024365081917494535,-0.003373726038262248,0.04145476967096329,-0.04944698512554169,0.01990712434053421,0.013154291547834873,0.007325295824557543,0.013479073531925678,-0.05045904591679573,0.0063544404692947865,-0.009249971248209476,0.0004509707214310765,0.0395120270550251,0.019143741577863693,0.015743721276521683,-0.09334325045347214,0.03048819862306118,0.09761986136436462,0.047795556485652924,0.04843325912952423,0.025513090193271637,-0.0025257898960262537,-0.0014076161896809936,0.01046433299779892,0.015413523651659489,0.037998318672180176,-0.0023573741782456636,0.0225254874676466,0.06289738416671753,0.012676888145506382,-0.015760065987706184,-0.015430484898388386,-0.027504902333021164,-0.09679438918828964,-0.037962451577186584,0.12685717642307281,-0.02708323858678341,0.002701301360502839,-0.047319091856479645,-0.017398079857230186,-0.015059491619467735,0.06084979325532913,-0.020202960819005966,0.02947789430618286,-0.018189065158367157,0.016466647386550903,0.07222291827201843,0.04946069046854973,-0.036919426172971725,0.024540526792407036,-0.025684306398034096,-0.04126208275556564,-0.04896577447652817,0.07825209945440292,-0.026196187362074852,-0.1346631795167923,-0.015309875831007957,0.0186998900026083,0.016023969277739525,-0.0024935181718319654,0.07397652417421341,0.007931520231068134,-0.04681604728102684,0.034394484013319016,0.11501041799783707,0.03726081922650337,-0.021878648549318314,-0.029001891613006592,0.006554843857884407,0.009669434279203415,0.03734361380338669,-0.001256725867278874,-0.06309456378221512,0.010351010598242283,0.0750790536403656,-0.029124407097697258,-0.014499210752546787,-0.01563897170126438,0.03227831795811653,0.09148893505334854,-0.010284083895385265,0.04025338590145111,-0.025430716574192047,-0.0002382067177677527,-0.042067769914865494,-0.03578883409500122,-0.06084642931818962,-0.026714356616139412,0.0156641136854887,-0.022167760878801346,0.07165369391441345,-0.025339074432849884,-0.03162180632352829,0.040767643600702286,0.04520610347390175,0.019426284357905388,0.03120977059006691,-0.04445759579539299,0.055368635803461075,-0.02255062200129032,-0.059282366186380386,0.01639324426651001,0.07201535999774933,0.004856129176914692,-0.03823183849453926,0.016637183725833893,0.017891963943839073,0.003977258689701557,0.0592372864484787,0.01784619316458702,0.062231287360191345,-0.06649386137723923,-0.04712593927979469,-0.24758750200271606,0.05357184261083603,-0.021194932982325554,-0.009221856482326984,0.07350798696279526,0.02615555189549923,0.04968363791704178,-0.0036740123759955168,-0.02561185508966446,0.033892687410116196,0.09434222429990768,-0.02038486860692501,0.010068899020552635,0.04081498086452484,0.009961573407053947,0.05321928858757019,0.02634073980152607,0.02258557640016079,-0.044975727796554565,0.0070078712888062,0.0010840930044651031,0.03427617996931076,-0.016534743830561638,0.003201707499101758,0.05912750959396362,-0.03209460899233818,0.1771358847618103,-0.013577401638031006,0.0038361011538654566,-0.016834108158946037,0.05507836863398552,-0.011810368858277798,-0.037958141416311264,-0.12273433059453964,0.055441562086343765,0.052092257887125015,-0.045903559774160385,-0.01842457614839077,-0.009774468839168549,-0.022463303059339523,-0.060274407267570496,0.07056780904531479,-0.023116329684853554,-0.026219911873340607,0.04892402142286301,-0.04899890720844269,-0.012685505673289299,0.00683840736746788,-0.04277588799595833,0.022833848372101784,-0.005619159433990717,-0.05929974466562271,0.058515142649412155,0.02300892025232315,-0.008185637183487415,-0.07814309746026993,-0.0319252647459507,0.03768828883767128,-0.04027886688709259,-0.013915514573454857,-0.0018974150298163295,-0.052706874907016754,0.0046427142806351185,-0.006663228385150433,0.026295790448784828,0.029423905536532402,0.022122731432318687,-0.03724609687924385,0.055116403847932816,-0.0195572841912508,0.00423869863152504,0.04846617951989174,-0.034605178982019424,0.025967493653297424,0.017350003123283386,-0.014182887971401215,0.04463447257876396,0.011648585088551044,-0.051522061228752136,-0.041434597223997116,0.036711178719997406,0.006260537542402744,0.018107939511537552,0.003951495513319969,0.026027986779808998,0.024258514866232872,0.036626119166612625,0.02862240932881832,0.04293844848871231,-0.057411760091781616,0.004415720235556364,0.012196460738778114,0.02866058237850666,0.019903749227523804,0.06628933548927307,-0.022429335862398148,-0.28404510021209717,0.04309704899787903,0.01945428177714348,0.02461262047290802,-0.07454215735197067,0.020702384412288666,-0.03592805191874504,0.015687590464949608,-0.025346986949443817,0.03139059990644455,0.009886513464152813,0.04557500034570694,-0.023690272122621536,-0.004794524051249027,0.0000748163292882964,0.031528204679489136,0.06410188227891922,-0.04330994188785553,0.05906631797552109,-0.04765573889017105,-0.004435886163264513,0.029539495706558228,0.21953564882278442,0.007651960011571646,-0.007107809651643038,-0.03397633880376816,0.05801483988761902,-0.005039002280682325,0.037627335637807846,-0.025462621822953224,0.05734902620315552,-0.009404030628502369,0.07386902719736099,-0.054442062973976135,0.04187047854065895,0.04352957755327225,-0.048265811055898666,0.07922068983316422,0.017422184348106384,-0.026617353782057762,-0.06114690750837326,-0.03332653269171715,-0.10685956478118896,-0.07147295773029327,0.07439673691987991,-0.06532516330480576,-0.05367875471711159,-0.07201921939849854,0.0038244903553277254,0.004245331976562738,-0.05193018168210983,-0.005315006244927645,-0.010796038433909416,0.012668470852077007,-0.005541631951928139,0.005613196641206741,-0.0628368929028511,-0.02859269455075264,-0.051867518573999405,-0.023952599614858627,0.0056649767793715,-0.07860130071640015,-0.020335234701633453,0.05702003836631775,0.027401410043239594]),
    ('Tours', new.id, '#1ADBDB', 'tour', true, array[-0.01900223083794117,-0.0022117882035672665,0.03192122280597687,-0.015602081082761288,0.017936302348971367,0.030568888410925865,0.018950698897242546,0.017821762710809708,-0.0129733020439744,-0.0350261852145195,-0.010166817344725132,-0.08196692913770676,0.023949187248945236,0.04422793909907341,0.030231589451432228,-0.022358620539307594,0.030382778495550156,0.015215526334941387,-0.049458879977464676,0.02127065509557724,-0.030584746971726418,-0.01940508373081684,-0.017453163862228394,-0.02305767498910427,0.05924008786678314,0.04473106935620308,-0.012835117988288403,-0.00886455923318863,-0.09158632904291153,-0.12534502148628235,0.03967919573187828,-0.06540720164775848,0.01903284154832363,-0.05659953132271767,-0.019908946007490158,-0.029676510021090508,0.02178884483873844,0.05049991235136986,-0.053038209676742554,0.044466469436883926,0.05834614485502243,0.022966232150793076,-0.004310000687837601,-0.06695695221424103,-0.027223454788327217,-0.025683708488941193,-0.05891402065753937,-0.023241734132170677,0.08669670671224594,-0.029505819082260132,-0.011800461448729038,-0.026623455807566643,0.01593703031539917,0.023716352880001068,0.046126589179039,0.03818090632557869,0.06008007004857063,-0.0035353463608771563,0.038026005029678345,0.03340435028076172,-0.021941695362329483,0.06046367064118385,-0.22319185733795166,0.1028253361582756,-0.00577530125156045,0.01820734143257141,-0.025477349758148193,0.012894711457192898,0.024260688573122025,0.019506169483065605,-0.048352133482694626,0.008649048395454884,0.058011244982481,0.06529541313648224,-0.004271809943020344,-0.022341400384902954,0.010813046246767044,-0.06504037976264954,-0.014841632917523384,0.04644656181335449,-0.012937207706272602,0.0212235264480114,0.005457764491438866,-0.0022695616353303194,-0.018800172954797745,-0.048273395746946335,0.0008219477022066712,-0.02868354506790638,0.03953200951218605,-0.022686609998345375,-0.04585346207022667,-0.019699569791555405,-0.009812677279114723,0.03306478634476662,-0.06557992100715637,-0.03730572387576103,-0.020371735095977783,-0.02427268773317337,-0.056869011372327805,0.26645222306251526,-0.0585494190454483,0.03462368622422218,0.06345053762197495,-0.010164014995098114,0.021014226600527763,-0.07496576011180878,-0.01665758341550827,-0.014343587681651115,-0.0414775125682354,0.015409072861075401,-0.04336632415652275,-0.010678088292479515,0.001641894574277103,0.005384443327784538,0.037158768624067307,0.0028657419607043266,0.09296797960996628,0.004514459054917097,-0.011676426976919174,0.011948873288929462,-0.01853063702583313,0.01925811544060707,0.027023615315556526,-0.026833895593881607,0.028595564886927605,-0.09312812983989716,0.01979699172079563,0.09705311059951782,0.02141186222434044,0.04605642706155777,0.05240325629711151,-0.007816911675035954,-0.03641050308942795,-0.03312455490231514,0.004613250959664583,0.03679661452770233,0.05966375395655632,-0.027544021606445312,0.047455303370952606,-0.02058877982199192,-0.030520034953951836,-0.10153767466545105,0.004625702276825905,-0.1616441011428833,0.012258300557732582,0.11046433448791504,-0.010669960640370846,0.044732384383678436,-0.06797247380018234,0.010840551927685738,0.009756471030414104,0.059676457196474075,0.004444161895662546,-0.059114158153533936,0.0011546907480806112,0.04060741886496544,0.015214883722364902,-0.005218234844505787,-0.0041870479471981525,0.009917058050632477,-0.031490109860897064,-0.05949101597070694,-0.039229024201631546,0.056668300181627274,0.007663097232580185,-0.08844864368438721,-0.059806887060403824,0.0285944864153862,0.025394311174750328,-0.0069504654966294765,0.03930303826928139,0.032702282071113586,-0.09286756813526154,0.007271808106452227,0.0947730615735054,0.02403339557349682,-0.014896556735038757,0.008101573213934898,-0.01677233912050724,0.015574164688587189,0.02488058991730213,-0.04752802848815918,-0.03755280002951622,0.043754350394010544,0.05955345556139946,-0.029411012306809425,-0.006644319277256727,-0.05521459877490997,0.04322589561343193,0.007712208665907383,-0.024032587185502052,-0.03494331240653992,-0.034192536026239395,-0.0519418939948082,-0.06958357989788055,-0.052294522523880005,-0.019239282235503197,-0.004646882880479097,0.025417452678084373,-0.04539809003472328,0.04788399487733841,-0.01798807643353939,-0.019873308017849922,0.04824233427643776,0.06090071052312851,-0.04238574206829071,-0.035396333783864975,-0.018543532118201256,0.06655452400445938,0.06132502108812332,-0.03503300994634628,0.0364474356174469,0.061930276453495026,0.03062286600470543,-0.04148048162460327,0.05073133483529091,0.08102656900882721,0.053658463060855865,0.02410503290593624,0.006386857479810715,0.05824530869722366,-0.12305228412151337,-0.05640551075339317,-0.20266464352607727,0.02801954559981823,0.002248382428660989,-0.04769435152411461,0.028367329388856888,-0.03985551744699478,-0.010903666727244854,0.00814503151923418,-0.00898363534361124,0.08201417326927185,0.042258087545633316,-0.021745946258306503,0.005980044603347778,0.04775291308760643,0.012966914102435112,0.06362418085336685,0.0021592897828668356,0.010147545486688614,-0.00557252112776041,0.006185212638229132,-0.01205130573362112,0.0024238387122750282,-0.019534584134817123,-0.032691534608602524,0.0543566569685936,0.03269222006201744,0.19919735193252563,0.02572035603225231,0.03957664221525192,-0.049463193863630295,0.04190392792224884,0.024984439834952354,-0.0018074908293783665,-0.1117246225476265,0.023165300488471985,0.02623973973095417,0.01971594989299774,-0.05822819471359253,-0.017677530646324158,-0.0285622738301754,-0.04063886031508446,0.06424786150455475,-0.033200621604919434,-0.08548789471387863,-0.00741029717028141,-0.00646166643127799,-0.03896220028400421,-0.03245210275053978,-0.005477127619087696,0.012324045412242413,0.006392094772309065,-0.010792246088385582,-0.008595961146056652,0.007052868138998747,0.013069522567093372,-0.04765310883522034,-0.08076146990060806,0.011040067300200462,-0.07038892805576324,0.031164323911070824,-0.028019269928336143,-0.0072141531854867935,-0.020489666610956192,-0.029700947925448418,0.08978737145662308,0.006455467082560062,-0.01751849800348282,-0.0002727233513724059,0.0004551684542093426,-0.03309020400047302,-0.02977372333407402,0.02971678599715233,0.013496889732778072,-0.012191380374133587,0.06924327462911606,0.021091477945446968,0.05826225131750107,-0.014008777216076851,-0.009890845976769924,-0.05683695524930954,0.029256494715809822,-0.027352333068847656,0.03828402981162071,0.04790310189127922,0.039766035974025726,-0.0006842709262855351,0.03346738591790199,0.028054695576429367,0.042671505361795425,-0.0336342491209507,0.010303666815161705,0.030194301158189774,-0.09118882566690445,-0.017662018537521362,0.03839549794793129,0.012758723460137844,-0.27151116728782654,0.07884301990270615,-0.006681504193693399,-0.03071952611207962,0.013186147436499596,0.01282778475433588,-0.023594796657562256,0.06583313643932343,-0.08538852632045746,0.02091372385621071,0.11098506301641464,0.034634463489055634,0.02405637316405773,0.012790958397090435,-0.008417733944952488,0.03517862781882286,0.05224855616688728,-0.007198347244411707,0.00982539914548397,-0.08037617802619934,0.0032916793134063482,0.013266583904623985,0.234315887093544,-0.018468402326107025,-0.008919939398765564,0.033636365085840225,0.002703738631680608,0.04482926055788994,0.004632432013750076,0.03582051768898964,0.055616337805986404,0.023191552609205246,0.0762922465801239,-0.03844214230775833,0.025199230760335922,0.06378793716430664,-0.016195740550756454,0.02190089412033558,0.018201742321252823,-0.029066482558846474,-0.09719998389482498,0.01724071614444256,-0.041917599737644196,-0.04177311807870865,0.061989955604076385,-0.04052861034870148,-0.0006624770467169583,-0.06919632107019424,0.021972214803099632,-0.007930359803140163,-0.012265454046428204,-0.02218327298760414,-0.01084876712411642,0.019745487719774246,0.053677551448345184,-0.010769972577691078,-0.05986538529396057,-0.03729548305273056,-0.01493612490594387,0.008824791759252548,0.02749933861196041,-0.017161257565021515,-0.04398278892040253,0.017740532755851746,-0.019461028277873993]),
    ('Car', new.id, '#0064d9', 'car', true, array[-0.06661754846572876,-0.017912868410348892,0.03440268337726593,-0.07042843103408813,0.013769486919045448,0.0055146971717476845,0.02264634519815445,0.015503639355301857,-0.001445465604774654,-0.04381164535880089,0.008797277696430683,-0.053945429623126984,0.0628214105963707,0.025152431800961494,-0.01019834540784359,0.01265021227300167,0.03178388252854347,0.03976287692785263,-0.021182961761951447,0.001740352250635624,0.033098720014095306,0.0013877152232453227,-0.02334347553551197,-0.05548957735300064,-0.0011675511486828327,0.05458329617977142,-0.06558828800916672,-0.06255369633436203,-0.05001455545425415,-0.10804299265146255,-0.015341013669967651,-0.04594080522656441,0.06035856902599335,-0.03422413021326065,-0.004402738530188799,-0.017449265345931053,-0.01249469630420208,0.010350830852985382,-0.0599287711083889,0.008351565338671207,-0.004933812189847231,0.016262587159872055,-0.045051459223032,-0.0838211253285408,-0.0023807191755622625,-0.04116562753915787,-0.0036869794130325317,-0.009402363561093807,0.049857981503009796,-0.04271234944462776,0.0033843310084193945,-0.020230449736118317,0.02883637323975563,0.05608298256993294,-0.027566565200686455,0.036174215376377106,0.03501080721616745,0.04137727990746498,0.016525326296687126,0.04057099670171738,0.040713682770729065,0.04304935038089752,-0.19961684942245483,0.09529886394739151,0.029102232307195663,0.06284013390541077,-0.05112667381763458,-0.04617369920015335,0.04355338588356972,0.07388012111186981,-0.04594332352280617,0.01809690333902836,-0.00376006867736578,0.06017012149095535,0.051135092973709106,-0.03457160294055939,0.0034961197525262833,-0.030946260318160057,-0.017486022785305977,0.001590299536474049,-0.010150810703635216,-0.04199729487299919,-0.027936894446611404,0.017625730484724045,-0.02202766388654709,-0.022262467071413994,-0.0021996833384037018,-0.034043967723846436,0.07772689312696457,-0.013751483522355556,-0.045700524002313614,0.01653086021542549,-0.009888896718621254,0.015007366426289082,-0.04972827807068825,-0.03400363773107529,0.05323105677962303,-0.0009146463125944138,-0.04117502272129059,0.2708910405635834,-0.05906206741929054,-0.02957867830991745,0.032345034182071686,-0.04270553216338158,0.040245961397886276,-0.021731646731495857,0.007385855074971914,-0.003930359613150358,-0.03947504609823227,0.016782335937023163,0.019889596849679947,-0.02124428004026413,0.024998506531119347,-0.03280923515558243,0.02012120932340622,-0.0374956876039505,0.018466530367732048,0.002757208188995719,0.028218932449817657,-0.02663835883140564,-0.00040348642505705357,0.03665226325392723,0.01998775638639927,-0.020169071853160858,0.020768102258443832,-0.0799737200140953,0.01849338971078396,0.10333673655986786,0.007518363185226917,0.04299623891711235,0.06575173884630203,0.007426356431096792,-0.055770330131053925,0.03412043675780296,0.009432222694158554,0.017672445625066757,-0.02123197354376316,0.0039108749479055405,-0.012736148200929165,-0.003603491000831127,-0.06863424181938171,-0.052908457815647125,0.03110441006720066,-0.11880262941122055,-0.028518591076135635,0.10461217910051346,-0.03640346601605415,0.05137774720788002,-0.06008101627230644,-0.013243786990642548,-0.014941987581551075,0.04038184508681297,0.0012051250087097287,-0.00408482551574707,0.034393180161714554,0.04041966050863266,0.05410201475024223,0.0037717383820563555,-0.05893640220165253,0.021519171074032784,-0.028430774807929993,-0.032536037266254425,-0.03753647580742836,0.11979769170284271,0.010468753054738045,-0.0755787342786789,-0.0029934216290712357,0.08451467752456665,0.006750850938260555,-0.01342407800257206,0.013614756986498833,0.05412249639630318,-0.02874232642352581,0.03125019371509552,0.055627670139074326,0.005660416092723608,-0.020441289991140366,-0.02587379701435566,0.045717138797044754,-0.03677166998386383,0.053773801773786545,-0.0335063710808754,-0.023818407207727432,0.030758420005440712,0.04747621342539787,-0.028492212295532227,-0.009758224710822105,-0.04146488010883331,0.007464645430445671,0.04932720586657524,0.003028047736734152,0.03888358920812607,-0.01064563263207674,-0.018446512520313263,-0.05864585563540459,-0.005353345535695553,-0.06516491621732712,0.005843746475875378,0.0011092376662418246,-0.06688516587018967,0.046458758413791656,-0.002311593620106578,0.019576430320739746,0.03121628426015377,0.02664596401154995,0.012287632562220097,-0.06374093145132065,-0.009876566007733345,0.03602202981710434,0.012938639149069786,-0.061821769922971725,0.02476883865892887,0.06895078718662262,-0.0013759199064224958,-0.03338145837187767,0.018113747239112854,-0.03172292560338974,0.07761875540018082,-0.0017090996261686087,0.07163325697183609,0.007983935065567493,-0.044274624437093735,-0.06415429711341858,-0.2646450400352478,0.017889605835080147,-0.020123429596424103,0.00024625385412946343,0.06925848126411438,-0.03603396192193031,-0.007682290859520435,-0.012481410056352615,0.0007426344673149288,0.061695974320173264,0.0737791657447815,-0.021675439551472664,-0.03177638724446297,0.017109166830778122,-0.013045601546764374,0.02642250992357731,0.022851189598441124,0.01490785926580429,-0.05230076611042023,-0.021700650453567505,-0.019647348672151566,-0.0023548032622784376,-0.015080895274877548,-0.06768915802240372,0.026900863274931908,0.00181567610707134,0.2120850831270218,0.022240206599235535,0.03507478907704353,-0.0044991858303546906,0.03554196655750275,0.00949619710445404,-0.0492156483232975,-0.1333152800798416,0.02614152431488037,0.0940435603260994,0.023359185084700584,-0.0037705712020397186,0.01217717956751585,-0.01366211473941803,-0.045424748212099075,0.04367046803236008,0.0011690551182255149,-0.08444396406412125,-0.0077827321365475655,-0.0224749818444252,-0.029568813741207123,-0.014318185858428478,-0.029794400557875633,0.006293837912380695,0.004842750262469053,-0.032637592405080795,0.005224420689046383,0.022823002189397812,0.0042839329689741135,-0.04842546209692955,-0.10416670143604279,0.010237740352749825,-0.006583233363926411,0.025172945111989975,0.03017735667526722,-0.0905810296535492,0.03630441054701805,-0.05704234540462494,0.049373138695955276,-0.0047965338453650475,0.008370066992938519,-0.035849329084157944,0.04221935570240021,-0.03337772190570831,-0.012881233356893063,0.11565454304218292,-0.022791942581534386,-0.0031876510474830866,0.0658482164144516,0.02341897413134575,0.08262187987565994,-0.01129334419965744,-0.0501861535012722,-0.0242783110588789,-0.004055559169501066,-0.01653672195971012,0.02707839570939541,0.04431875795125961,0.04861411824822426,0.026630600914359093,0.07593025267124176,-0.0028852559626102448,0.008493229746818542,-0.024397198110818863,0.031189171597361565,0.010738094337284565,-0.04236379638314247,-0.023878009989857674,0.021017463877797127,0.008104736916720867,-0.2952691614627838,0.05134296417236328,0.017616992816329002,0.04782705381512642,-0.05856649950146675,0.020565781742334366,0.02557527646422386,0.02251933515071869,-0.03896161541342735,0.024350332096219063,-0.009941580705344677,-0.00503632752224803,0.01397236343473196,-0.028976736590266228,0.013651890680193901,0.055249616503715515,0.08140018582344055,-0.037561479955911636,0.07196186482906342,-0.036916106939315796,-0.017782025039196014,0.07602456957101822,0.22702732682228088,-0.06942787766456604,0.03611953184008598,0.023516256362199783,-0.017702462151646614,0.0256802961230278,0.049120038747787476,0.016110895201563835,0.039514701813459396,0.014250420033931732,0.10024885088205338,-0.010977367870509624,0.01877223514020443,0.04446609318256378,-0.06376214325428009,0.017091186717152596,0.027548575773835182,-0.014399025589227676,-0.04807731509208679,0.01237467024475336,-0.053495701402425766,-0.030034249648451805,0.06427783519029617,-0.01935957930982113,-0.02475588768720627,-0.039942461997270584,-0.009692317806184292,0.044893402606248856,-0.04168178513646126,-0.03601958602666855,-0.03289879113435745,0.02290935069322586,0.06115632876753807,-0.01049218699336052,-0.03333268314599991,-0.009713302366435528,-0.07287706434726715,-0.06686870008707047,0.030030913650989532,-0.0570843443274498,-0.020737847313284874,0.03035241924226284,0.0014699796447530389]),
    ('Train', new.id, '#e9be26', 'train', true, array[-0.03489544987678528,-0.0006098966696299613,0.06372195482254028,-0.05019458755850792,0.02131739817559719,0.014705440029501915,0.06009005755186081,0.03841541334986687,-0.0160807054489851,0.0013540383661165833,-0.012843981385231018,-0.1066337302327156,0.032786477357149124,0.03902469947934151,0.018333707004785538,0.00002572136145317927,0.0443674698472023,0.02136090211570263,-0.01788686029613018,0.020335571840405464,0.004955660551786423,-0.03598416596651077,-0.02126581035554409,-0.06437484920024872,-0.009750504046678543,0.026701519265770912,-0.06753899157047272,-0.023023784160614014,-0.04698473960161209,-0.14680500328540802,-0.040959324687719345,-0.07602972537279129,0.032636817544698715,-0.03702530637383461,-0.031036626547574997,-0.041072554886341095,-0.009596898220479488,0.011948646046221256,-0.03403300419449806,0.05184942111372948,0.06010371074080467,0.03386640548706055,-0.0448046550154686,-0.06575559824705124,-0.015094212256371975,-0.018092870712280273,0.0008313040598295629,-0.0453733429312706,0.08101264387369156,-0.03874519094824791,0.036729130893945694,-0.036007754504680634,0.020160404965281487,0.009172004647552967,0.006681420840322971,-0.0008669878006912768,0.049566905945539474,0.03002220392227173,0.02338375523686409,0.03784694895148277,0.02202877216041088,0.033981047570705414,-0.22589458525180817,0.07642368972301483,-0.008856021799147129,0.027399448677897453,-0.007808175403624773,-0.035780198872089386,0.03383253514766693,0.060179829597473145,-0.012843863107264042,0.022183356806635857,0.014993925578892231,0.058828867971897125,0.014400461688637733,-0.030144261196255684,-0.011180602014064789,-0.05895543098449707,-0.003790519433096051,0.012130273506045341,0.01017824187874794,-0.07529561966657639,-0.028786785900592804,-0.004753266926854849,-0.03646906465291977,-0.011051337234675884,0.003537052543833852,-0.055118028074502945,0.046571072190999985,-0.00921700056642294,-0.08445233106613159,0.02493954822421074,-0.038167890161275864,0.03792564198374748,-0.053157102316617966,-0.03231939673423767,0.008534357883036137,-0.023942995816469193,-0.05444701761007309,0.26985183358192444,-0.028888097032904625,-0.0065529681742191315,0.07751064747571945,-0.01805577240884304,0.04089926555752754,-0.04072362557053566,-0.04530470073223114,-0.0029744054190814495,-0.04144518822431564,0.03763178363442421,0.044912565499544144,0.007553603034466505,-0.026759421452879906,0.020178163424134254,0.03717711940407753,-0.009796799160540104,-0.033878911286592484,0.039302848279476166,-0.021270491182804108,-0.03075648471713066,-0.014323909766972065,0.03461680933833122,0.04246608912944794,-0.013178604654967785,-0.006216051988303661,-0.14079907536506653,0.04060475900769234,0.12292420864105225,0.025739025324583054,0.052558835595846176,0.014456836506724358,-0.032182976603507996,-0.03187995031476021,-0.025322116911411285,-0.008029626682400703,0.026509160175919533,0.05577807128429413,-0.020527517423033714,0.035607416182756424,0.014591502025723457,-0.05283986032009125,-0.05924356356263161,0.02159997820854187,-0.10374224185943604,-0.014111412689089775,0.07971523702144623,-0.06017080694437027,0.028518714010715485,-0.016192948445677757,-0.01993238925933838,-0.014139456674456596,0.047068916261196136,0.041778597980737686,-0.012450356036424637,0.02940378710627556,0.05963800475001335,-0.004242443945258856,0.019102804362773895,-0.02142317034304142,0.014425891451537609,-0.02701644040644169,-0.006799761671572924,-0.028695283457636833,0.07318445295095444,-0.016096938401460648,-0.12263371050357819,-0.024835221469402313,0.013091694563627243,0.016774486750364304,-0.03233732655644417,0.020425308495759964,0.02140123024582863,-0.04780839756131172,0.006346837151795626,0.08008570224046707,0.04884500801563263,-0.03090769611299038,0.021405544131994247,-0.022222157567739487,0.00811803713440895,0.025382105261087418,-0.02046302519738674,-0.051989153027534485,0.02835770510137081,0.036056701093912125,0.014088133350014687,-0.010211358778178692,-0.016748329624533653,0.033952392637729645,0.08140230178833008,-0.018717782571911812,0.03043566271662712,-0.01294145081192255,-0.010509324260056019,-0.021949727088212967,-0.0022626984864473343,-0.03585001453757286,0.030692394822835922,0.0002939495607279241,-0.0620284304022789,0.03348676487803459,-0.0010780509328469634,0.01181149110198021,0.051389243453741074,0.01514045987278223,0.018566563725471497,-0.020046638324856758,-0.012127650901675224,0.0015211111167445779,0.054329805076122284,-0.04204461723566055,-0.005695803090929985,0.07138237357139587,-0.023358985781669617,-0.028981436043977737,0.006987180560827255,0.0023225760087370872,0.026074783876538277,0.013106254860758781,0.056989990174770355,0.01872686669230461,-0.057415664196014404,-0.02324201725423336,-0.26117533445358276,0.0525987409055233,0.008851735852658749,0.01422462984919548,0.0991213321685791,-0.014273890294134617,0.02102569118142128,0.02098655514419079,-0.020839126780629158,0.03299069404602051,0.08789357542991638,-0.03928248584270477,-0.028637569397687912,0.002065288135781884,-0.049769479781389236,0.08510826528072357,0.03554230555891991,-0.022440284490585327,-0.04322047531604767,0.024178721010684967,-0.013296197168529034,0.06400499492883682,-0.041508421301841736,-0.019424399361014366,0.03443604335188866,-0.007822207175195217,0.21688811480998993,-0.03865017741918564,0.04844771325588226,-0.028418876230716705,0.024133838713169098,0.018674394115805626,-0.04031013697385788,-0.0687713623046875,0.03329763188958168,0.034259092062711716,0.030067985877394676,0.007512333337217569,0.004006249364465475,-0.03311078995466232,-0.054831068962812424,0.07577385753393173,0.015458989888429642,-0.07788169384002686,0.027482204139232635,-0.048771947622299194,-0.04524090886116028,0.006918114610016346,-0.06485803425312042,-0.03239446133375168,0.0316537469625473,-0.045497648417949677,0.03515620529651642,0.017844308167696,0.0060577974654734135,-0.04204583913087845,-0.08231452852487564,0.037405941635370255,-0.0237626563757658,0.02984028123319149,0.018917124718427658,-0.023335227742791176,0.017931614071130753,-0.04643364995718002,0.08766545355319977,-0.01803983375430107,-0.013198984786868095,-0.027546647936105728,0.03738155961036682,-0.06285358965396881,-0.01444487739354372,0.05135307088494301,0.015043612569570541,0.02012435905635357,0.07687721401453018,-0.010278914123773575,0.030696235597133636,-0.03706153854727745,0.0007836904260329902,-0.015577302314341068,0.04583709314465523,0.00557501008734107,-0.003097980050370097,0.017579203471541405,0.036304451525211334,-0.005744779948145151,0.0388907827436924,0.003541609738022089,0.04384533315896988,-0.026848701760172844,0.0018683193484321237,-0.000986051862128079,-0.020511703565716743,-0.042285870760679245,0.036425407975912094,0.0030037632677704096,-0.3259687125682831,0.03922964632511139,0.03615907207131386,0.019864961504936218,-0.04111821576952934,0.02703947015106678,0.006198990624397993,0.05514281243085861,-0.04873025789856911,0.031060725450515747,0.03257627785205841,0.014376471750438213,0.0031522156205028296,0.01914234645664692,-0.0022128974087536335,0.05577949434518814,0.06665336340665817,-0.05073054879903793,0.03936810418963432,-0.060972344130277634,0.01342837419360876,0.03567765653133392,0.19971686601638794,-0.001801358419470489,0.02795863151550293,0.003991392441093922,-0.0323198027908802,0.014747096225619316,-0.0038342855405062437,0.003649438964203,0.057686205953359604,0.013316437602043152,0.08649227023124695,-0.012624108232557774,0.007199068553745747,0.07100999355316162,-0.038445815443992615,0.014246311970055103,0.01243891753256321,-0.03433355689048767,-0.08553647249937057,-0.009547829627990723,-0.05037490651011467,-0.016818663105368614,0.0962098017334938,-0.028039323166012764,-0.03777356073260307,-0.07764163613319397,-0.01394438836723566,-0.011710326187312603,0.004253108520060778,0.025411490350961685,-0.04406275227665901,0.02381215989589691,0.010690259747207165,-0.0000919010053621605,-0.01875118538737297,-0.004323145374655724,-0.020116467028856277,-0.038294386118650436,0.05201740190386772,-0.05709776654839516,-0.0688428282737732,0.048010315746068954,-0.004038076847791672]),
    ('Cruise', new.id, '#d3e500', 'cruise', true, array[-0.015003038570284843,-0.008011563681066036,0.04966170713305473,-0.036293890327215195,0.011336826719343662,0.03529863432049751,0.07098012417554855,0.02165718749165535,0.004514095839112997,-0.0013533219462260604,0.04360971227288246,-0.11226873844861984,0.014210417866706848,0.03323187679052353,-0.01660056971013546,-0.03853808343410492,-0.00798858143389225,-0.0005982612492516637,-0.03460003063082695,0.07131923735141754,0.0426020510494709,-0.0522405244410038,-0.007941399700939655,-0.04014258459210396,0.07869419455528259,0.007491719909012318,-0.07995127141475677,-0.03390071168541908,-0.057546619325876236,-0.09841230511665344,-0.014883712865412235,-0.05602900683879852,0.03199939802289009,-0.044026680290699005,-0.023034902289509773,-0.02373100072145462,-0.05892327427864075,0.03858792781829834,0.019673021510243416,0.023096619173884392,0.03742365166544914,0.008223775774240494,-0.03435899689793587,-0.035678546875715256,-0.045316342264413834,-0.05045676231384277,-0.0541193000972271,-0.0327424593269825,-0.003980519715696573,-0.0010205738944932818,0.003783434396609664,-0.05251345783472061,-0.01584041304886341,0.10021308809518814,0.021516118198633194,0.036146145313978195,0.05236898362636566,-0.019317254424095154,-0.014555975794792175,0.04835568368434906,0.012613201513886452,0.009833158925175667,-0.20954276621341705,0.0653809905052185,0.04610965773463249,0.03264842554926872,-0.041170936077833176,-0.047792479395866394,0.001471781637519598,0.01603541150689125,-0.015404421836137772,0.01520706806331873,0.011724311858415604,-0.0035054089967161417,0.05661672726273537,-0.015197200700640678,0.00101388746406883,-0.029890524223446846,0.009630747139453888,0.0373171903192997,-0.005568533670157194,-0.06040005013346672,-0.029004275798797607,0.02621777355670929,-0.0387473925948143,-0.07251550257205963,0.07737604528665543,-0.026015587151050568,0.07913777977228165,0.011950031854212284,0.01949825882911682,-0.023166988044977188,-0.03693019598722458,-0.011594260111451149,-0.07095582783222198,0.010058767162263393,0.040491603314876556,0.006197246257215738,-0.047371186316013336,0.26060736179351807,-0.026895200833678246,0.012454655021429062,0.052171219140291214,-0.07851367443799973,0.060450125485658646,0.0061570219695568085,-0.05213110148906708,-0.001667967764660716,-0.04437215253710747,0.030183987691998482,-0.019828397780656815,-0.013293424621224403,0.012906336225569248,-0.031820815056562424,0.03704014793038368,0.03107406571507454,0.01874922215938568,0.014947121031582355,0.006695596035569906,-0.031484514474868774,0.014680004678666592,0.06038977578282356,-0.002098041120916605,0.026264984160661697,0.013779174536466599,-0.05677376687526703,0.05347047001123428,0.1650608628988266,0.03552071377635002,0.08176425844430923,0.030185233801603317,-0.022885296493768692,-0.03252043575048447,0.003119657514616847,-0.011417667381465435,0.029699226841330528,0.025798050686717033,0.025917913764715195,0.01965194195508957,0.021206462755799294,-0.029893837869167328,-0.11324705928564072,-0.05005478486418724,-0.09050924330949783,-0.03133994713425636,0.09751999378204346,-0.06989764422178268,0.01665751077234745,-0.016792207956314087,0.002712532877922058,-0.061112355440855026,0.03883923590183258,-0.0289365965873003,-0.0036244450602680445,0.03598859906196594,0.014150504022836685,0.011401190422475338,0.04817395657300949,-0.06161459535360336,-0.03551992028951645,0.031366977840662,-0.06320936977863312,-0.06115520000457764,0.0804811418056488,0.00491870054975152,-0.12393034249544144,0.01594719849526882,0.030201951041817665,-0.03306165337562561,-0.032599031925201416,0.03357773274183273,0.014008506201207638,-0.049634240567684174,0.027986282482743263,0.07720085233449936,-0.020535990595817566,0.007515194360166788,0.04703748598694801,-0.0032522042747586966,0.034444570541381836,0.07288064807653427,-0.00528850220143795,-0.028934530913829803,0.04270473122596741,0.027274465188384056,-0.009280834347009659,0.016264410689473152,0.00025746095343492925,0.007896598428487778,0.060138240456581116,-0.010952278971672058,0.04961709305644035,-0.0636790543794632,-0.04968738555908203,-0.04985148459672928,-0.01186668686568737,-0.005841713398694992,0.00836702436208725,0.04318877309560776,-0.0005905610742047429,0.04887790232896805,0.030167240649461746,-0.05130968987941742,0.02631782367825508,0.0067877271212637424,-0.004866817966103554,0.022229382768273354,0.019962556660175323,0.03912569209933281,0.0580550953745842,-0.049792613834142685,-0.009876678697764874,0.06733471155166626,-0.037977054715156555,-0.05054670572280884,0.003012461122125387,0.03702925145626068,0.06887410581111908,0.06720693409442902,0.022197525948286057,-0.01592874526977539,-0.03076435998082161,-0.0035494156181812286,-0.18486401438713074,0.040326979011297226,0.007064971141517162,-0.0388365313410759,0.015613654628396034,-0.0008360287174582481,-0.0050661638379096985,-0.00544651597738266,0.06193698197603226,0.046666841953992844,0.036101385951042175,-0.02944987639784813,-0.04911354184150696,0.01147591881453991,0.010666685178875923,0.02621176280081272,0.04261545091867447,0.03123912774026394,-0.0015730794984847307,-0.037073928862810135,0.029780449345707893,0.003545191837474704,-0.06438212841749191,-0.03464079275727272,0.0821676105260849,-0.028500346466898918,0.18195787072181702,-0.0005710665718652308,0.010029595345258713,-0.05296505615115166,0.018591370433568954,0.06264086067676544,0.01914878375828266,-0.11403285712003708,0.021779851987957954,0.022385936230421066,0.00155682023614645,-0.02940232679247856,-0.08520521223545074,-0.016498718410730362,0.03272971510887146,0.02461676113307476,-0.04784834012389183,-0.04443007707595825,-0.026367684826254845,0.015091551467776299,-0.04806007817387581,-0.0006683201063424349,-0.04663785547018051,0.013525047339498997,0.01167329028248787,-0.00997406430542469,0.016054168343544006,0.012443012557923794,0.06990328431129456,-0.060330599546432495,-0.09725034981966019,0.000012144516404077876,-0.04051455482840538,0.007933719083666801,-0.009522688575088978,-0.05018279328942299,0.012581183575093746,-0.005451777018606663,0.060950249433517456,-0.007945546880364418,-0.02835000306367874,-0.03951677307486534,0.03236402943730354,-0.090728260576725,0.004653075709939003,0.05134843289852142,0.046245139092206955,-0.037576138973236084,0.03808268904685974,0.022558003664016724,0.05017132684588432,-0.0010829935781657696,-0.018580812960863113,-0.00807894766330719,0.07552484422922134,-0.024847958236932755,0.015393105335533619,0.04416938126087189,0.0165781881660223,0.002391623565927148,0.04854530096054077,0.0053530544973909855,0.014004623517394066,-0.01908487267792225,-0.009699343703687191,0.02368934638798237,-0.03138188272714615,-0.08665744960308075,-0.01026457455009222,-0.002947581931948662,-0.3076630234718323,0.044314611703157425,-0.017176158726215363,-0.005510986316949129,-0.03158530220389366,0.0001392340927850455,-0.03180735185742378,0.007901512086391449,-0.05755944550037384,0.031395357102155685,0.07616396993398666,0.05804142355918884,-0.010845660232007504,0.0224008671939373,0.0163448303937912,0.03231910988688469,0.008534310385584831,-0.024509109556674957,0.03404923528432846,0.013898325152695179,0.011586369946599007,0.04034699127078056,0.22017988562583923,-0.064466692507267,0.05544860288500786,-0.0016721070278435946,-0.06133168935775757,0.0313829705119133,0.05968241021037102,-0.02248534932732582,0.028896939009428024,0.03409428149461746,0.06281142681837082,-0.05048326030373573,0.007927564904093742,0.10551082342863083,-0.018843410536646843,0.04241213575005531,-0.024569274857640266,0.035623062402009964,-0.006325806491076946,0.02541922591626644,-0.0038536465726792812,-0.045808449387550354,0.11241550743579865,-0.022666392847895622,-0.019879499450325966,-0.07353926450014114,0.05360489711165428,-0.014825011603534222,-0.07682997733354568,-0.003080541966482997,0.004036754369735718,0.0018255597678944468,0.0062451655976474285,-0.02594154328107834,-0.07022657990455627,-0.039725471287965775,-0.059779033064842224,-0.04973393678665161,-0.0195848997682333,-0.005807270295917988,-0.10180052369832993,0.05096513032913208,0.010937252081930637]),
    ('Activity', new.id, '#ff8976', 'activity', true, array[-0.055920396000146866,0.009380275383591652,0.04847823828458786,-0.0017814788734540343,-0.009133153595030308,0.0033661937341094017,0.05686885863542557,0.06945410370826721,-0.03154052793979645,-0.04057127609848976,0.00489357253536582,-0.02187531441450119,0.06486200541257858,0.021365342661738396,0.03233778849244118,0.03346562385559082,0.027589136734604836,-0.026339001953601837,-0.03570681810379028,0.06762341409921646,0.0663326233625412,-0.016820812597870827,-0.03218218311667442,-0.038299378007650375,0.06064056605100632,-0.011477180756628513,-0.05796588584780693,-0.04541189596056938,-0.03293547034263611,-0.09737753123044968,0.026075638830661774,-0.007530358154326677,0.04634597525000572,-0.014130957424640656,-0.0319075845181942,-0.06215126812458038,-0.018705449998378754,0.01219598762691021,-0.05900575593113899,0.05371026694774628,0.002418010262772441,0.007184430491179228,-0.01218203455209732,-0.022749457508325577,-0.0611010417342186,-0.05342143401503563,0.00021642429055646062,0.011582158505916595,0.05185617506504059,-0.08912879973649979,0.032464273273944855,0.021821768954396248,0.018219640478491783,0.031487930566072464,0.042593225836753845,0.03919203579425812,0.07516046613454819,0.014121207408607006,0.034272242337465286,0.04515250027179718,0.02744137868285179,0.010079973377287388,-0.24545983970165253,0.1343693882226944,0.023442447185516357,0.0380944088101387,-0.056738268584012985,0.0006462910096161067,0.01746492274105549,0.023025108501315117,-0.062273990362882614,0.03154595568776131,-0.011601096019148827,0.08230224251747131,0.0036356712225824594,0.006734765600413084,-0.008617715910077095,-0.027318473905324936,-0.02150901034474373,0.02927260659635067,0.02290160395205021,-0.01780529133975506,0.015402976423501968,0.002679685363546014,-0.013614538125693798,-0.0585324726998806,0.015940027311444283,-0.034638527780771255,0.005122709088027477,-0.010557996109127998,-0.08127179741859436,0.007421539630740881,-0.017827095463871956,0.03539787977933884,-0.04499223455786705,-0.04372674971818924,-0.001140369102358818,-0.0178621094673872,-0.06382200866937637,0.2612241804599762,-0.06539630144834518,-0.019407158717513084,0.054973479360342026,-0.05417218059301376,0.06241745501756668,-0.027346527203917503,-0.017400791868567467,-0.03302204981446266,-0.012457323260605335,0.040065255016088486,0.012222091667354107,-0.025698060169816017,0.015034587122499943,0.0013174787163734436,0.04403810203075409,0.03413841500878334,0.02936384081840515,0.014637044630944729,0.048680346459150314,-0.030370749533176422,-0.04114050418138504,-0.008619822561740875,0.017325889319181442,-0.03512699156999588,0.036081910133361816,-0.07830527424812317,0.0490647554397583,0.12587447464466095,0.01418114360421896,0.05598122626543045,0.028709758073091507,-0.03405434638261795,-0.005735830403864384,-0.013208922930061817,0.00606866180896759,0.023387400433421135,0.027304047718644142,-0.011135484091937542,0.0017553818179294467,-0.033789265900850296,-0.048629678785800934,-0.1548142433166504,0.0008965331362560391,-0.1043752059340477,-0.00444251112639904,0.11559886485338211,-0.0017028473084792495,0.046292584389448166,-0.018245885148644447,-0.00001937794149853289,-0.017129313200712204,0.06417471915483475,0.04140247404575348,-0.02734479121863842,0.021975120529532433,0.007186640053987503,0.0565517358481884,0.0498882420361042,-0.00878166314214468,-0.01692369021475315,-0.024886222556233406,-0.04517124220728874,-0.057807717472314835,0.12288467586040497,0.0019335206598043442,-0.1254752278327942,-0.05981907248497009,-0.03104272112250328,-0.02498936839401722,0.009239818900823593,0.004820931237190962,0.024362286552786827,-0.050202202051877975,0.0068025351502001286,0.07498939335346222,0.000015077394891704898,-0.059967558830976486,0.010100185871124268,-0.024772949516773224,-0.0010022285860031843,0.010369653813540936,-0.024405619129538536,-0.02790258452296257,0.003482020227238536,0.01965184696018696,-0.04913865029811859,-0.033900078386068344,-0.03841676935553551,0.06048315018415451,0.02037452720105648,0.0022055315785109997,0.020854340866208076,-0.003675322514027357,-0.04103405401110649,-0.029540695250034332,-0.023787640035152435,-0.03745781630277634,-0.011065663769841194,-0.0032420482020825148,-0.05321785807609558,0.10291548073291779,-0.009583127684891224,-0.04081214591860771,0.0380634069442749,0.022360622882843018,0.019129939377307892,0.010584801435470581,-0.020278234034776688,0.06482822448015213,0.031057074666023254,-0.010551146231591702,-0.01091656181961298,0.09970439970493317,-0.01709403097629547,-0.03220866620540619,-0.015483809635043144,0.055450960993766785,0.033798061311244965,0.044700220227241516,0.05458148196339607,0.016529254615306854,-0.028086788952350616,-0.053486645221710205,-0.2163596749305725,-0.04878231883049011,0.004220799542963505,-0.016085505485534668,0.040643226355314255,-0.04221414029598236,0.018525870516896248,-0.03530365601181984,0.0023059870582073927,0.05177241936326027,0.07413801550865173,0.028708359226584435,-0.008757563307881355,0.020577076822519302,-0.028299717232584953,0.04262832552194595,0.018731864169239998,0.022113805636763573,-0.006135824602097273,0.025844767689704895,-0.033988188952207565,0.02706940285861492,-0.02734169363975525,-0.04195841774344444,0.04847626015543938,-0.028065713122487068,0.1921590119600296,-0.007671872153878212,0.022195935249328613,-0.025566548109054565,0.07707156240940094,0.019882643595337868,-0.055432531982660294,-0.1095518246293068,0.07812436670064926,0.03467826917767525,0.03066711500287056,-0.005250564776360989,-0.03277640789747238,-0.03839963674545288,-0.06684130430221558,0.016908183693885803,0.01498446986079216,-0.025197889655828476,-0.015742937102913857,-0.017529524862766266,-0.05382237210869789,0.029706554487347603,-0.0349951833486557,-0.0239269882440567,0.016283521428704262,-0.008531293831765652,0.06691958755254745,0.011298191733658314,-0.010112672112882137,-0.026517808437347412,-0.06252624839544296,0.020884819328784943,-0.04248007386922836,0.031071342527866364,0.008759464137256145,-0.02662479691207409,0.027211401611566544,-0.05019048601388931,0.07753971219062805,0.027994230389595032,-0.033829569816589355,0.004238882567733526,0.021878497675061226,-0.004110707901418209,0.003711596829816699,0.07639172673225403,0.0012934306869283319,0.010576114989817142,-0.0038151137996464968,0.009804417379200459,0.06561310589313507,-0.027170466259121895,-0.0014106251765042543,-0.029243405908346176,0.06247866898775101,-0.03612843155860901,0.06120501458644867,0.01842261664569378,-0.02795107290148735,-0.05719786882400513,0.08445882797241211,-0.0017074965871870518,-0.025146206840872765,-0.013239509426057339,-0.011318295262753963,-0.006659684237092733,-0.02161473035812378,-0.05272034555673599,0.04088747501373291,-0.02544221840798855,-0.28364303708076477,0.0347600020468235,0.000855776306707412,0.03466542065143585,-0.08425328880548477,0.013151461258530617,0.030584853142499924,0.0923861414194107,-0.069706991314888,-0.007630116306245327,0.03840770199894905,-0.025737149640917778,0.02794204093515873,0.006097768433392048,0.007483920082449913,0.05029704421758652,0.0643082782626152,-0.06234203651547432,-0.009950877167284489,-0.018058741465210915,0.01869947463274002,0.03500444069504738,0.19962503015995026,-0.03302517533302307,0.07015204429626465,0.027166634798049927,0.013706334866583347,0.034615837037563324,0.021793711930513382,-0.027381502091884613,0.014352677389979362,-0.0057233357802033424,0.06759880483150482,-0.05242195725440979,0.026339629665017128,-0.03608628734946251,-0.06041654199361801,0.03401048481464386,-0.0029053748585283756,-0.029922043904662132,-0.09644898772239685,0.03220023959875107,-0.058994192630052567,-0.019216354936361313,0.10628505051136017,0.02744751237332821,-0.053607262670993805,-0.039795905351638794,0.03029593825340271,0.03035382181406021,-0.0489751361310482,-0.011262462474405766,-0.002151425927877426,0.016251781955361366,0.018335601314902306,0.01230036560446024,-0.035719823092222214,-0.024815600365400314,-0.061948440968990326,-0.022406205534934998,0.008757386356592178,-0.03351317346096039,-0.05253705009818077,0.023777266964316368,0.017604053020477295]),
    ('Taxes', new.id, '#e5e926', 'taxes', true, array[0.006132954265922308,-0.03834177926182747,0.061257123947143555,-0.053003136068582535,-0.008463420905172825,0.02591342106461525,0.04921531304717064,0.04525524377822876,0.00638900650665164,-0.0020209818612784147,-0.01866729184985161,-0.09181801974773407,0.055141616612672806,0.037668969482183456,-0.023068418726325035,-0.013150183483958244,-0.006734780967235565,0.007897059433162212,-0.0326068140566349,0.003934602718800306,0.003940459340810776,-0.03213796392083168,-0.014262014999985695,-0.047781217843294144,0.04258362948894501,0.037059683352708817,-0.0660826712846756,-0.03532344847917557,-0.07078646868467331,-0.1406932771205902,0.0002035155048361048,-0.03833300247788429,0.052779827266931534,-0.01746278814971447,-0.020378965884447098,-0.0307454951107502,-0.015776801854372025,0.0539010614156723,-0.07051311433315277,0.05603000521659851,0.05815509334206581,0.00579936383292079,-0.03013996034860611,-0.04834982007741928,-0.033240512013435364,-0.030877482146024704,-0.028548577800393105,-0.013265810906887054,0.009589487686753273,-0.055379468947649,0.031066864728927612,-0.039400335401296616,0.02833055518567562,0.03212432190775871,0.02411641925573349,0.0415414460003376,0.08598381280899048,0.015598705038428307,0.04436210170388222,0.05657529458403587,0.052848558872938156,0.03434630483388901,-0.2277737855911255,0.09080946445465088,0.01724964752793312,0.0020347507670521736,-0.01894395612180233,-0.04370834305882454,0.050356946885585785,0.03629966452717781,-0.019286591559648514,0.04289204999804497,0.031043782830238342,0.10588204860687256,0.03902198746800423,-0.029842127114534378,-0.005432948470115662,-0.03445906192064285,-0.016923388466238976,0.0004958880017511547,-0.04421978443861008,-0.053958576172590256,-0.0042093354277312756,0.051727842539548874,0.017364652827382088,-0.04095239192247391,-0.007857094518840313,-0.053048063069581985,0.0402875654399395,0.028570786118507385,-0.044459693133831024,0.04188649356365204,-0.05063603073358536,0.018337493762373924,-0.06973063200712204,0.0053757308050990105,0.012453336268663406,0.023539971560239792,-0.03198276087641716,0.27065303921699524,-0.08794702589511871,0.022694945335388184,0.01886594295501709,0.002561385976150632,0.013231133110821247,-0.012954006902873516,0.005281178746372461,-0.012418106198310852,-0.047289974987506866,0.01474912092089653,0.03816515579819679,-0.02240421436727047,0.04566759988665581,-0.03619552031159401,-0.0018300251103937626,0.03495687618851662,0.03799228370189667,0.048649970442056656,-0.01731286011636257,-0.01376722939312458,-0.0057369801215827465,0.029371991753578186,0.03581041842699051,-0.029856838285923004,0.01839395985007286,-0.06748919188976288,0.039556026458740234,0.11906419694423676,0.037431322038173676,0.056519363075494766,0.024178238585591316,-0.0021976600401103497,-0.030040934681892395,-0.010463234037160873,0.0019771887455135584,-0.017027229070663452,-0.009951555170118809,-0.011314132250845432,0.04585781693458557,-0.0011445303680375218,-0.02866780012845993,-0.060980767011642456,0.04714192450046539,-0.1518644243478775,-0.012101494707167149,0.07903096079826355,-0.014231173321604729,0.014938157051801682,-0.00107891287188977,0.026101481169462204,-0.01772858016192913,0.04418927803635597,-0.01663323864340782,-0.016153667122125626,0.0459427535533905,0.008856476284563541,0.05490503087639809,0.03265083581209183,-0.054022934287786484,0.00004855250517721288,-0.07258666306734085,-0.08070426434278488,-0.025139495730400085,0.09774854779243469,0.007464342750608921,-0.06323463469743729,0.002945144660770893,0.03112414851784706,-0.015794266015291214,-0.03648817539215088,0.03776967525482178,0.06520383059978485,-0.029410580173134804,-0.004266782198101282,0.08375651389360428,0.02269810438156128,-0.008946959860622883,0.018198896199464798,0.004907743073999882,-0.004017685540020466,0.05658477544784546,-0.048806142061948776,-0.04675326123833656,0.0009328716550953686,-0.0017491334583610296,-0.015953347086906433,-0.017936743795871735,-0.016931641846895218,0.08493860065937042,0.0664893090724945,-0.03992598131299019,0.02618936076760292,-0.008597388863563538,-0.024041349068284035,-0.04253135249018669,-0.048853322863578796,0.010297080501914024,-0.026173245161771774,0.004190581850707531,-0.016648095101118088,0.0847163200378418,-0.015368358232080936,-0.038077451288700104,0.02016315795481205,0.03939744085073471,0.012584773823618889,-0.03831086307764053,-0.006887827534228563,0.029103705659508705,0.018614156171679497,-0.032289110124111176,0.012770061381161213,0.06360830366611481,-0.007540709339082241,-0.0402904711663723,-0.005548703949898481,-0.0031541045755147934,0.02188095822930336,0.01102285273373127,0.03886648267507553,0.014803814701735973,-0.07217111438512802,-0.025047557428479195,-0.24308344721794128,-0.029408901929855347,0.014754005707800388,-0.0649476945400238,0.03511539101600647,-0.0078092277981340885,0.024709133431315422,-0.04061197489500046,0.030693460255861282,0.03356514126062393,0.07350307703018188,-0.03542559593915939,-0.031528327614068985,0.011296873912215233,-0.02330283634364605,0.037035707384347916,0.00046474524424411356,0.0108600789681077,0.018060659989714622,-0.012451152317225933,0.0034388438798487186,-0.02240184135735035,0.0006308124866336584,-0.06724265962839127,0.0443316251039505,-0.018017418682575226,0.18808385729789734,0.07518308609724045,0.037414222955703735,-0.034400444477796555,0.05661550536751747,0.039951372891664505,-0.032671477645635605,-0.16677646338939667,0.022793183103203773,0.015308908186852932,0.04489601030945778,-0.016564149409532547,-0.058453742414712906,-0.038819730281829834,-0.05807950720191002,0.06328292191028595,0.005942734889686108,-0.07518940418958664,-0.002935655415058136,0.008496595546603203,-0.0014110412448644638,-0.014625336043536663,-0.04134855791926384,-0.015888560563325882,0.0169096477329731,-0.03768136724829674,0.06523698568344116,0.006765080615878105,-0.028066473081707954,-0.007470827549695969,-0.027927953749895096,0.009881565347313881,-0.046222932636737823,0.010412875562906265,-0.03330845385789871,-0.010600828565657139,0.024176623672246933,-0.03348006680607796,0.06472949683666229,0.037639129906892776,-0.03292315453290939,-0.0583169050514698,0.04967040941119194,-0.048397909849882126,-0.04475798457860947,0.06833332031965256,-0.027010727673768997,-0.05263814330101013,0.04148965701460838,0.030102482065558434,0.004714162088930607,-0.014204045757651329,0.023781200870871544,-0.004602181725203991,0.025970779359340668,-0.04359355568885803,0.0005560819990932941,-0.03748694434762001,0.017194584012031555,-0.032674726098775864,0.06472340226173401,-0.03191998973488808,0.023456038907170296,-0.07219153642654419,0.03076556883752346,-0.0023477249778807163,-0.028093179687857628,-0.008282897993922234,0.029549922794103622,-0.043529678136110306,-0.31861069798469543,0.011545920744538307,0.013573084957897663,-0.017930369824171066,-0.06896253675222397,0.007560309022665024,0.02872716635465622,0.050126854330301285,-0.06310737878084183,0.022541435435414314,0.036431699991226196,0.04542585462331772,-0.01086363010108471,0.03567640855908394,-0.02148442156612873,0.04270177707076073,0.018674015998840332,-0.031988803297281265,0.03937055543065071,-0.0644490122795105,0.04521184042096138,0.05402807518839836,0.20274469256401062,-0.027081813663244247,0.06805457174777985,0.01729651354253292,-0.020448796451091766,0.032394472509622574,0.03297801688313484,-0.022328626364469528,0.030710997059941292,0.024207934737205505,0.10447714477777481,-0.035724248737096786,0.0320238396525383,0.06050197407603264,-0.02486511506140232,0.0420595146715641,0.020584115758538246,-0.03494517132639885,-0.030156003311276436,0.017170187085866928,-0.04963336139917374,-0.006495217327028513,0.09088395535945892,-0.02533775381743908,-0.023285891860723495,-0.07257838547229767,0.01489465031772852,0.015372240915894508,-0.0027975463308393955,0.005917313974350691,-0.05178713798522949,0.009563462808728218,0.056653764098882675,0.04759736731648445,-0.04290078207850456,-0.013838953338563442,-0.0055465493351221085,-0.033580902963876724,0.004259208682924509,-0.0437779575586319,0.017515327781438828,0.00013475320884026587,0.025485269725322723]),
    ('Fees', new.id, '#40b9fe', 'Fees', true, array[-0.02396402880549431,-0.02829921245574951,0.04679616168141365,-0.0264216847717762,-0.011936414055526257,0.0004047313123010099,0.06021416559815407,0.009801547043025494,0.020502394065260887,-0.03269050270318985,-0.004175667185336351,-0.060218099504709244,0.01748662441968918,0.029932493343949318,0.022365309298038483,0.009195842780172825,0.003342369804158807,-0.02804255299270153,-0.03243422880768776,0.06305331736803055,0.045058123767375946,-0.07448292523622513,-0.005331282038241625,-0.023263730108737946,0.008486860431730747,0.05898737534880638,-0.006930977571755648,-0.04782678931951523,-0.08152752369642258,-0.14244168996810913,0.024207191541790962,-0.07845424860715866,-0.007286990527063608,-0.05111822113394737,0.035355158150196075,-0.04227827116847038,-0.009083891287446022,0.013350466266274452,0.009901254437863827,0.08011576533317566,0.02319400943815708,0.04920225217938423,-0.05732560530304909,-0.06385954469442368,-0.035890817642211914,-0.048497509211301804,-0.03223450854420662,-0.04961368814110756,0.02014189027249813,0.023621119558811188,0.03505818918347359,-0.03305515646934509,0.026552729308605194,0.03260347247123718,-0.002516721375286579,0.03223961964249611,0.06016000732779503,0.0171198733150959,0.026146063581109047,0.03391612321138382,-0.03532719612121582,0.020945392549037933,-0.2506234049797058,0.10022687911987305,-0.02608727663755417,0.026288354769349098,-0.02095125988125801,-0.013511180877685547,0.051156386733055115,0.035526372492313385,-0.03623630851507187,0.038070615381002426,0.049273550510406494,0.04581429809331894,0.044374555349349976,-0.020984696224331856,-0.027827784419059753,-0.0430402047932148,-0.0028978832997381687,0.02344661019742489,-0.05108053237199783,-0.010954181663691998,-0.009286749176681042,0.015821224078536034,-0.04347946122288704,-0.030994173139333725,0.01313601154834032,-0.045704279094934464,0.012693683616816998,0.0007516753394156694,0.009149874560534954,-0.03877520561218262,-0.02159452624619007,0.010335719212889671,-0.0885881558060646,-0.023207206279039383,-0.004640973638743162,0.00313839060254395,-0.08659987151622772,0.28284958004951477,-0.03481210395693779,0.020433930680155754,0.03418838605284691,-0.010124988853931427,0.0016285430174320936,-0.03381163626909256,-0.002257250715047121,-0.020759249106049538,-0.03263978660106659,0.0153549425303936,0.018090521916747093,-0.01192814577370882,0.06453551352024078,-0.037880562245845795,-0.005700599867850542,0.06571981310844421,0.03362680971622467,0.01677328161895275,0.008685696870088577,-0.0031878624577075243,-0.009699800983071327,-0.021015439182519913,-0.0006868279888294637,-0.007124645635485649,-0.0032890078146010637,-0.08419542759656906,0.004832832608371973,0.14256040751934052,0.029546493664383888,0.048523206263780594,0.02826080471277237,-0.0318731963634491,-0.06113561987876892,-0.011999600566923618,0.029306333512067795,0.02302663028240204,0.03421951085329056,-0.021482914686203003,0.007591148838400841,0.0033772240858525038,-0.05867186561226845,-0.0949055552482605,-0.024160167202353477,-0.08648038655519485,-0.04569891840219498,0.05982265621423721,-0.0295015387237072,0.06010492518544197,-0.026706065982580185,-0.011711537837982178,-0.00972460862249136,0.02502167783677578,-0.04082527384161949,-0.010766572318971157,0.03862692043185234,0.004695343319326639,0.03028968907892704,0.0024884112644940615,-0.04079267755150795,0.013530832715332508,-0.035389505326747894,-0.02079271711409092,-0.04320639744400978,0.13929444551467896,0.013674210757017136,-0.11266077309846878,-0.04310208186507225,0.011203151196241379,-0.013271382078528404,-0.030836230143904686,-0.030468424782156944,0.01971268467605114,-0.024166472256183624,0.003422457491979003,0.12331271171569824,0.006507187616080046,-0.04441865533590317,0.01333178486675024,-0.001780612743459642,-0.0058268094435334206,0.03432933986186981,-0.0024497052654623985,-0.06037871912121773,0.034623656421899796,0.013144074007868767,-0.0828932672739029,-0.0710841715335846,-0.05479610338807106,0.05967136472463608,0.059798434376716614,-0.04105125367641449,0.014265142381191254,-0.03801798075437546,-0.019706115126609802,-0.018527768552303314,-0.01190025545656681,-0.005555754993110895,-0.041157741099596024,0.00030419850372709334,-0.04909925535321236,0.11013878881931305,0.01723468489944935,0.013017727062106133,0.007386729586869478,0.01821485534310341,0.020219337195158005,-0.001396415289491415,0.0329422689974308,0.032566215842962265,0.009931821376085281,-0.03737901896238327,0.0500282384455204,0.0630040243268013,-0.0103317154571414,-0.07532966881990433,0.03026312217116356,0.028634538874030113,0.020092224702239037,0.04549918323755264,0.06581871211528778,0.03061104007065296,-0.10875475406646729,-0.04378422349691391,-0.20417171716690063,0.035224199295043945,-0.004259161651134491,-0.016283975914120674,0.0916910320520401,-0.01699851267039776,0.04901793971657753,-0.01755913719534874,-0.0022317226976156235,0.08104009181261063,0.08211608976125717,-0.02155546098947525,-0.00907350517809391,0.014560142531991005,0.008633923716843128,0.05783089995384216,0.012586789205670357,0.08510276675224304,0.007145349867641926,-0.003257250413298607,-0.058121081441640854,0.051437195390462875,-0.0033930938225239515,-0.008553525432944298,0.05930770933628082,0.01723240129649639,0.1971602439880371,-0.02308741770684719,-0.0130157470703125,-0.02581840194761753,0.061919908970594406,-0.02278503216803074,0.029494795948266983,-0.10845335572957993,0.006872301455587149,0.020102577283978462,0.002800633432343602,0.03244049474596977,0.017888199537992477,-0.06690885126590729,-0.01591486483812332,0.01111130602657795,-0.01910349540412426,-0.06603699922561646,-0.013492163270711899,0.021749773994088173,-0.01557245384901762,0.04550468921661377,-0.04281115531921387,-0.027361810207366943,-0.00009327743464382365,-0.086065374314785,0.05298822745680809,0.015826858580112457,0.05445363000035286,-0.0525331050157547,-0.09122144430875778,0.004696170333772898,-0.07404770702123642,0.017769495025277138,0.01574586145579815,-0.02691296488046646,0.04885648190975189,-0.04357058182358742,0.05360741913318634,-0.04341130331158638,-0.0015050959773361683,0.000032445535907754675,-0.016056343913078308,-0.0791698694229126,-0.027366042137145996,0.01220267079770565,0.01722651906311512,-0.04358948394656181,0.021927623078227043,-0.007212981581687927,0.0464288666844368,0.010946004651486874,-0.034789878875017166,0.0002546226023696363,0.012935874052345753,-0.013492097146809101,0.00860277097672224,0.06100165471434593,0.027234956622123718,0.03786196559667587,0.04090243950486183,0.0062590125016868114,0.035656630992889404,-0.05996961146593094,-0.015821389853954315,0.026555335149168968,-0.06870424747467041,0.026362843811511993,-0.0033775002229958773,-0.03074413537979126,-0.2699477970600128,0.03560442477464676,0.012608562596142292,0.02399642951786518,-0.025331055745482445,0.005905950907617807,0.004278813023120165,0.029847774654626846,-0.03762522712349892,-0.0070111872628331184,0.08417811244726181,0.04251735284924507,0.008453170768916607,0.026049073785543442,0.0172120351344347,0.053769517689943314,0.0628603994846344,-0.03210647776722908,0.033357519656419754,-0.013232721947133541,0.024440428242087364,0.022018110379576683,0.2101966291666031,-0.04138137027621269,0.012185649946331978,-0.014369496144354343,-0.013363952748477459,0.061784710735082626,0.07181528210639954,0.004098554141819477,0.026901215314865112,0.0433337427675724,0.08281780779361725,-0.049075253307819366,0.05258188769221306,0.039597947150468826,-0.048714570701122284,0.02514396235346794,-0.005871814209967852,-0.03666914626955986,0.0004940903163515031,0.01722368411719799,-0.03417564928531647,-0.015935808420181274,0.0564008466899395,0.002529596909880638,-0.028262143954634666,-0.06570950895547867,0.009428431279957294,0.052344080060720444,-0.011971858330070972,0.015635894611477852,0.007452681660652161,0.020169846713542938,0.07169412076473236,0.03074728697538376,-0.035854265093803406,-0.0281260684132576,-0.02272292785346508,-0.058996204286813736,-0.014633078128099442,-0.04708487540483475,-0.056401364505290985,0.054252199828624725,-0.002884818008169532]),
    ('Other', new.id, 'hsl(var(--primary))', 'other', true, array[-0.016038237139582634,-0.029635660350322723,0.0552101656794548,-0.02966766245663166,0.004088574089109898,0.04646525904536247,0.04162515327334404,0.0468568429350853,0.0041376701556146145,-0.0700305923819542,0.015760943293571472,-0.1065179854631424,0.016229869797825813,0.02340550720691681,-0.004380081780254841,0.01943296566605568,-0.02728545293211937,0.02649248018860817,-0.08855333179235458,-0.001389984623529017,-0.0035120882093906403,0.016653956845402718,0.001943283248692751,-0.02729872800409794,0.020853649824857712,0.04123387858271599,-0.0518169030547142,-0.03728645667433739,-0.03806275501847267,-0.12230280041694641,0.0031131755094975233,-0.04628312587738037,0.0021556371357291937,-0.007779688108712435,0.009602737613022327,-0.04664081707596779,-0.021287355571985245,0.032303813844919205,-0.050963204354047775,0.06130717322230339,0.04158814996480942,0.008656958118081093,-0.03772655129432678,-0.04675762727856636,-0.027823608368635178,-0.022637199610471725,-0.033783309161663055,0.008571564219892025,0.05185896158218384,-0.03107404336333275,0.034212999045848846,-0.02348235435783863,0.01064260769635439,0.03076563961803913,-0.005979669280350208,-0.007927840575575829,0.05196346342563629,0.03357013314962387,0.027521202340722084,0.007770419120788574,0.017884457483887672,0.027837643399834633,-0.24893254041671753,0.09230556339025497,0.020801395177841187,0.05085219442844391,-0.009705094620585442,-0.006953771226108074,0.0664878785610199,0.05362029746174812,-0.004976385738700628,-0.00547064607962966,0.03214143589138985,0.08563677966594696,0.011336484923958778,-0.04219050332903862,-0.010907702147960663,-0.040721651166677475,-0.027228664606809616,0.026380132883787155,-0.0453735888004303,-0.043119169771671295,-0.01866496540606022,-0.024267567321658134,0.002444261685013771,0.0011260344181209803,-0.012910588644444942,-0.039921846240758896,0.05262403190135956,0.03387255594134331,-0.06591424345970154,-0.008220764808356762,0.011475315317511559,0.02580339089035988,-0.049181561917066574,-0.023883456364274025,0.020132210105657578,-0.03140343725681305,-0.027124330401420593,0.2823719084262848,-0.07465120404958725,0.01545818243175745,0.0754019096493721,-0.022702714428305626,0.04981814697384834,-0.014354678802192211,-0.020464805886149406,-0.04612006992101669,-0.032458219677209854,0.05216376110911369,0.00443628104403615,-0.030673284083604813,0.007759553845971823,-0.03190002962946892,0.023081369698047638,-0.0022053492721170187,0.0512346588075161,0.03858109936118126,-0.018488507717847824,0.003108567325398326,-0.02169857919216156,0.022220604121685028,0.04623791575431824,-0.054168008267879486,0.041117485612630844,-0.07497250288724899,0.003920379094779491,0.10820597410202026,0.02476942539215088,0.041485752910375595,0.05151434242725372,-0.07325959950685501,-0.04023575782775879,0.01316655334085226,-0.013150190003216267,-0.03308451548218727,0.037513360381126404,-0.01965913735330105,0.046310972422361374,0.014074685983359814,-0.003533598966896534,-0.09264829754829407,-0.008515942841768265,-0.1068035215139389,-0.029684478417038918,0.06074381247162819,-0.02880842424929142,0.05665789544582367,-0.04763874411582947,0.058762356638908386,-0.0381779782474041,0.08265583962202072,-0.03863563388586044,0.03852960467338562,0.00832052156329155,-0.011502992361783981,0.03264286369085312,0.021745240315794945,-0.021209605038166046,0.04520263895392418,-0.021159006282687187,-0.04614114761352539,-0.009207709692418575,0.13617223501205444,0.027523765340447426,-0.13026639819145203,-0.03842264786362648,0.01026176754385233,0.023458706215023994,-0.023884549736976624,0.0295390747487545,0.034758903086185455,-0.052678629755973816,0.0076952846720814705,0.09078453481197357,-0.011651048436760902,-0.04799544811248779,0.020827973261475563,-0.028767216950654984,0.04817803204059601,0.025354688987135887,-0.036770693957805634,-0.05542534217238426,0.002648209687322378,0.026828495785593987,-0.03561233729124069,0.022126398980617523,-0.06258320063352585,0.0402095690369606,0.03598105534911156,-0.019931610673666,0.028119361028075218,-0.037152379751205444,-0.004285347182303667,-0.04492371901869774,-0.019544480368494987,-0.025245683267712593,-0.018726099282503128,-0.006253178231418133,-0.03681576997041702,0.02562558278441429,-0.008132285438477993,-0.021573934704065323,0.05093268305063248,0.03305936977267265,0.03483126312494278,-0.002185763558372855,-0.048794616013765335,0.025975815951824188,-0.05176341161131859,-0.07224364578723907,0.015988217666745186,0.08673690259456635,-0.015351559966802597,-0.031193573027849197,0.017472870647907257,0.001099121873266995,0.04909693822264671,-0.0013133174506947398,0.03767244145274162,0.04057091474533081,-0.07273522019386292,-0.03262757882475853,-0.2223435789346695,-0.015198108740150928,-0.005404704250395298,-0.054749198257923126,0.05739732086658478,-0.050060875713825226,0.05028267949819565,0.011125932447612286,-0.029026035219430923,0.09802126884460449,0.06772860884666443,-0.013338249176740646,-0.02274906635284424,0.04763224348425865,0.012918565422296524,0.046649571508169174,0.04009358957409859,-0.0070974682457745075,0.05174730345606804,-0.0015775976935401559,-0.022071296349167824,0.02643255703151226,-0.005175558850169182,-0.007624192163348198,0.02994590252637863,-0.006399694364517927,0.19938503205776215,0.05331771820783615,0.05945196747779846,-0.061543431133031845,0.046169962733983994,0.018232028931379318,-0.007382106967270374,-0.10230959951877594,0.04843439161777496,0.022067904472351074,0.0035502780228853226,-0.047056857496500015,-0.04854818060994148,-0.02754194289445877,-0.0050089661963284016,0.04871530830860138,-0.026200169697403908,-0.06078939884901047,-0.010932995937764645,-0.04794080927968025,-0.023844044655561447,0.0024475741665810347,-0.026567570865154266,0.012260076589882374,0.023290317505598068,-0.04001345857977867,0.01416479516774416,0.0028414514381438494,0.004133264534175396,-0.0375639870762825,-0.05604039877653122,-0.009006530977785587,-0.03865407407283783,0.04582803696393967,-0.018396396189928055,-0.04023846238851547,0.016332263126969337,-0.05053716525435448,0.04586195945739746,-0.019597461447119713,-0.034157801419496536,0.006127615459263325,0.02064480446279049,-0.03693069517612457,-0.020771687850356102,0.0704977959394455,-0.014854833483695984,-0.0360027514398098,0.04250502958893776,0.016088057309389114,0.02805475704371929,0.002843741560354829,-0.0342036597430706,-0.03415150195360184,0.0616958886384964,-0.03855198249220848,0.008797750808298588,0.035957131534814835,0.018066802993416786,-0.022690873593091965,0.02660704217851162,-0.017947059124708176,0.061403170228004456,-0.045113448053598404,0.011476526968181133,0.03331355005502701,0.0035048273857682943,-0.026703886687755585,0.015424499288201332,0.023773079738020897,-0.2798716723918915,0.03675656393170357,0.0038122148253023624,0.014431101270020008,-0.06801043450832367,0.012934847734868526,0.02705204114317894,0.052515409886837006,-0.0268262792378664,0.029099632054567337,0.05045941844582558,0.010791151784360409,0.02616424858570099,0.03125457093119621,-0.013795003294944763,0.040244992822408676,0.06971399486064911,-0.08716171234846115,0.0389789380133152,-0.012466520071029663,0.009698746725916862,0.06395283341407776,0.24043695628643036,-0.01638970524072647,-0.02728034183382988,0.04062063246965408,-0.016985345631837845,0.013145389035344124,-0.024175278842449188,-0.006498829927295446,0.05494659021496773,0.020828992128372192,0.06299994885921478,-0.047579076141119,0.018929963931441307,0.06346216797828674,-0.023079441860318184,0.05586616322398186,0.0061517683789134026,0.0026899222284555435,-0.02217250131070614,0.019602442160248756,-0.09541330486536026,0.00301083130761981,0.1153869703412056,-0.006943837273865938,-0.060351427644491196,-0.041160762310028076,0.031970903277397156,0.0016521798679605126,0.0034226360730826855,-0.009835615754127502,-0.08133038133382797,0.0074858576990664005,0.025633683428168297,-0.009468195028603077,-0.007696307729929686,-0.04234030470252037,-0.041713837534189224,-0.010110685601830482,0.03957059979438782,-0.0463101901113987,-0.08496274054050446,0.03962352126836777,0.049226365983486176]);

   return new;
end$$;

ALTER FUNCTION "public"."insert_system_categories"() OWNER TO "postgres";

CREATE OR REPLACE TRIGGER "insert_system_categories_trigger" 
AFTER INSERT ON "public"."teams" FOR EACH ROW 
EXECUTE FUNCTION "public"."insert_system_categories"();

GRANT ALL ON FUNCTION "public"."insert_system_categories"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_system_categories"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_system_categories"() TO "service_role";

CREATE OR REPLACE FUNCTION "public"."is_fulfilled"("public"."transactions") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $_$
declare
    attachment_count int;
begin
    select count(*) into attachment_count from transaction_attachments where transaction_id = $1.id;
    return attachment_count > 0 or $1.status = 'completed';
end;
$_$;

ALTER FUNCTION "public"."is_fulfilled"("public"."transactions") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."is_fulfilled"("public"."transactions") TO "anon";
GRANT ALL ON FUNCTION "public"."is_fulfilled"("public"."transactions") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_fulfilled"("public"."transactions") TO "service_role";

CREATE OR REPLACE FUNCTION public.match_transaction_with_inbox(p_transaction_id uuid, p_inbox_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(inbox_id uuid, transaction_id uuid, transaction_name text, score numeric, file_name text)
 LANGUAGE plpgsql
AS $function$
declare
  v_transaction record;
  v_inbox record;
  v_score numeric;
  v_threshold numeric := 0.9; -- 90% threshold
begin
  -- fetch transaction details
  select t.*, 
         abs(t.amount) as abs_amount,
         abs(t.base_amount) as abs_base_amount
  into v_transaction 
  from transactions t
  where t.id = p_transaction_id;

  -- Find potential matches for the transaction
  return query
  select 
      i.id as inbox_id, 
      v_transaction.id as transaction_id, 
      v_transaction.name as transaction_name,
      calculate_match_score(v_transaction, i.*) as score,
      i.file_name
    from inbox i
    where 
      i.team_id = v_transaction.team_id 
      and i.status = 'pending'
      and calculate_match_score(v_transaction, i.*) >= v_threshold
    order by 
      calculate_match_score(v_transaction, i.*) desc,
      abs(i.date - v_transaction.date) asc
    limit 1;
--   end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION "public"."nanoid"("size" integer DEFAULT 21, "alphabet" "text" DEFAULT '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'::"text", "additionalbytesfactor" double precision DEFAULT 1.6) RETURNS "text"
    LANGUAGE "plpgsql" PARALLEL SAFE
    AS $$
DECLARE
    alphabetArray  text[];
    alphabetLength int := 64;
    mask           int := 63;
    step           int := 34;
BEGIN
    IF size IS NULL OR size < 1 THEN
        RAISE EXCEPTION 'The size must be defined and greater than 0!';
    END IF;

    IF alphabet IS NULL OR length(alphabet) = 0 OR length(alphabet) > 255 THEN
        RAISE EXCEPTION 'The alphabet can''t be undefined, zero or bigger than 255 symbols!';
    END IF;

    IF additionalBytesFactor IS NULL OR additionalBytesFactor < 1 THEN
        RAISE EXCEPTION 'The additional bytes factor can''t be less than 1!';
    END IF;

    alphabetArray := regexp_split_to_array(alphabet, '');
    alphabetLength := array_length(alphabetArray, 1);
    mask := (2 << cast(floor(log(alphabetLength - 1) / log(2)) as int)) - 1;
    step := cast(ceil(additionalBytesFactor * mask * size / alphabetLength) AS int);

    IF step > 1024 THEN
        step := 1024; -- The step size % can''t be bigger then 1024!
    END IF;

    RETURN nanoid_optimized(size, alphabet, mask, step);
END
$$;

ALTER FUNCTION "public"."nanoid"("size" integer, "alphabet" "text", "additionalbytesfactor" double precision) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."nanoid_optimized"("size" integer, "alphabet" "text", "mask" integer, "step" integer) RETURNS "text"
    LANGUAGE "plpgsql" PARALLEL SAFE
    AS $$
DECLARE
    idBuilder      text := '';
    counter        int  := 0;
    bytes          bytea;
    alphabetIndex  int;
    alphabetArray  text[];
    alphabetLength int  := 64;
BEGIN
    alphabetArray := regexp_split_to_array(alphabet, '');
    alphabetLength := array_length(alphabetArray, 1);

    LOOP
        bytes := extensions.gen_random_bytes(step);
        FOR counter IN 0..step - 1
            LOOP
                alphabetIndex := (get_byte(bytes, counter) & mask) + 1;
                IF alphabetIndex <= alphabetLength THEN
                    idBuilder := idBuilder || alphabetArray[alphabetIndex];
                    IF length(idBuilder) = size THEN
                        RETURN idBuilder;
                    END IF;
                END IF;
            END LOOP;
    END LOOP;
END
$$;

ALTER FUNCTION "public"."nanoid_optimized"("size" integer, "alphabet" "text", "mask" integer, "step" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."nanoid"("size" integer, "alphabet" "text", "additionalbytesfactor" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."nanoid"("size" integer, "alphabet" "text", "additionalbytesfactor" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."nanoid"("size" integer, "alphabet" "text", "additionalbytesfactor" double precision) TO "service_role";

GRANT ALL ON FUNCTION "public"."nanoid_optimized"("size" integer, "alphabet" "text", "mask" integer, "step" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."nanoid_optimized"("size" integer, "alphabet" "text", "mask" integer, "step" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."nanoid_optimized"("size" integer, "alphabet" "text", "mask" integer, "step" integer) TO "service_role";

CREATE OR REPLACE FUNCTION "public"."project_members"("public"."tracker_entries") RETURNS TABLE("id" "uuid", "avatar_url" "text", "full_name" "text")
    LANGUAGE "sql"
    AS $_$
  select distinct on (users.id) users.id, users.avatar_url, users.full_name
  from tracker_entries
  join users on tracker_entries.user_id = users.id
  where tracker_entries.project_id = $1.project_id;
$_$;

ALTER FUNCTION "public"."project_members"("public"."tracker_entries") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."project_members"("public"."tracker_projects") RETURNS TABLE("id" "uuid", "avatar_url" "text", "full_name" "text")
    LANGUAGE "sql"
    AS $$
  select distinct on (users.id) users.id, users.avatar_url, users.full_name
  from tracker_projects
  left join tracker_entries on tracker_projects.id = tracker_entries.project_id
  left join users on tracker_entries.user_id = users.id;
$$;

ALTER FUNCTION "public"."project_members"("public"."tracker_projects") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_entries") TO "anon";
GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_entries") TO "authenticated";
GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_entries") TO "service_role";

GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_projects") TO "anon";
GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_projects") TO "authenticated";
GRANT ALL ON FUNCTION "public"."project_members"("public"."tracker_projects") TO "service_role";

GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";

GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";

GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";

CREATE OR REPLACE FUNCTION "public"."slugify"("value" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE STRICT
    AS $_$
  -- removes accents (diacritic signs) from a given string --
  with "unaccented" as (
    select unaccent("value") as "value"
  ),
  -- lowercases the string
  "lowercase" as (
    select lower("value") as "value"
    from "unaccented"
  ),
  -- remove single and double quotes
  "removed_quotes" as (
    select regexp_replace("value", '[''"]+', '', 'gi') as "value"
    from "lowercase"
  ),
  -- replaces anything that's not a letter, number, hyphen('-'), or underscore('_') with a hyphen('-')
  "hyphenated" as (
    select regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') as "value"
    from "removed_quotes"
  ),
  -- trims hyphens('-') if they exist on the head or tail of the string
  "trimmed" as (
    select regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') as "value"
    from "hyphenated"
  )
  select "value" from "trimmed";
$_$;

ALTER FUNCTION "public"."slugify"("value" "text") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."slugify"("value" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."slugify"("value" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."slugify"("value" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";

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

GRANT ALL ON FUNCTION "public"."total_duration"("public"."tracker_projects") TO "anon";
GRANT ALL ON FUNCTION "public"."total_duration"("public"."tracker_projects") TO "authenticated";
GRANT ALL ON FUNCTION "public"."total_duration"("public"."tracker_projects") TO "service_role";

GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "service_role";

GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "service_role";

GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "service_role";

CREATE OR REPLACE FUNCTION public.update_enrich_transaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin
  if new.category_slug is null then
    -- Find matching category_slug from transaction_enrichments and transaction_categories in one query
    begin
      new.category_slug := (
        select te.category_slug
        from transaction_enrichments te
        join transaction_categories tc on tc.slug = te.category_slug and tc.team_id = new.team_id
        where te.name = new.name
          and (te.system = true or te.team_id = new.team_id)
          and te.category_slug != 'income'
        limit 1
      );
    exception
      when others then
        new.category_slug := null; -- or set to a default value
    end;
  end if;

  return new;
end;$function$
;

ALTER FUNCTION "public"."update_enrich_transaction"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."update_enrich_transaction"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_enrich_transaction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_enrich_transaction"() TO "service_role";

CREATE TRIGGER enrich_transaction BEFORE INSERT ON public.transactions FOR EACH ROW 
EXECUTE FUNCTION update_enrich_transaction();

CREATE OR REPLACE FUNCTION public.update_transaction_frequency()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    v_transaction_group text;
    v_frequency transaction_frequency;
    v_recurring boolean;
    v_transaction_count bigint;
    v_avg_days_between float;
begin
    -- Get the transaction group for the new transaction
    select coalesce(st.similar_transaction_name, new.name)
    into v_transaction_group
    from identify_similar_transactions_v2(new.team_id) st
    where st.original_transaction_name = new.name
    limit 1;

    -- If no similar transaction found, use the new transaction name
    v_transaction_group := coalesce(v_transaction_group, new.name);

    -- Calculate frequency only for the affected transaction group
    with group_stats as (
        select 
            count(*) as transaction_count,
            avg(extract(epoch from (date::timestamp - lag(date::timestamp) over (order by date)))::float / (24 * 60 * 60)) as avg_days_between
        from transactions
        where team_id = new.team_id and coalesce(similar_transaction_name, name) = v_transaction_group
    )
    select
        transaction_count,
        avg_days_between,
        case 
            when transaction_count >= 2 and avg_days_between between 1 and 8 then 'weekly'::transaction_frequency
            when transaction_count >= 2 and avg_days_between between 9 and 16 then 'biweekly'::transaction_frequency
            when transaction_count >= 2 and avg_days_between between 18 and 40 then 'monthly'::transaction_frequency
            when transaction_count >= 2 and avg_days_between between 60 and 80 then 'semi_monthly'::transaction_frequency
            when transaction_count >= 2 and avg_days_between between 330 and 370 then 'annually'::transaction_frequency
            when transaction_count < 2 then 'unknown'::transaction_frequency
            else 'irregular'::transaction_frequency
        end,
        transaction_count >= 2
    into
        v_transaction_count,
        v_avg_days_between,
        v_frequency,
        v_recurring
    from group_stats;

    -- Update the frequency and recurring status on the new transaction
    update transactions
    set 
        frequency = v_frequency,
        recurring = v_recurring,
        similar_transaction_name = v_transaction_group
    where id = new.id;

    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION "public"."update_transactions_on_category_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    update transactions
    set category_slug = null
    where category_slug = old.slug
    and team_id = old.team_id;

    return old;
end;
$$;

ALTER FUNCTION "public"."update_transactions_on_category_delete"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."update_transactions_on_category_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_transactions_on_category_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_transactions_on_category_delete"() TO "service_role";

CREATE OR REPLACE FUNCTION public.upsert_transaction_enrichment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    transaction_name text;
    system_value boolean;
begin
    begin
        select new.name into transaction_name;

        select system into system_value
        from transaction_categories as tc
        where tc.slug = new.category_slug and tc.team_id = new.team_id;
        
        if new.team_id is not null then
            insert into transaction_enrichments(name, category_slug, team_id, system)
            values (transaction_name, new.category_slug, new.team_id, system_value)
            on conflict (team_id, name) do update
            set category_slug = excluded.category_slug;
        end if;

        return new;
    exception
        when others then
            -- Log the error
            raise notice 'Error in upsert_transaction_enrichment: %', sqlerrm;
            
            -- Return the original NEW record without modifications
            return new;
    end;
end;
$function$
;

ALTER FUNCTION "public"."upsert_transaction_enrichment"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."upsert_transaction_enrichment"() TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_transaction_enrichment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_transaction_enrichment"() TO "service_role";

CREATE OR REPLACE FUNCTION "public"."webhook"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    url text;
    secret text;
    payload jsonb;
    request_id bigint;
    signature text;
    path text;
BEGIN
    -- Extract the first item from TG_ARGV as path
    path = TG_ARGV[0];

    -- Get the webhook URL and secret from the vault
    SELECT decrypted_secret INTO url FROM vault.decrypted_secrets WHERE name = 'WEBHOOK_ENDPOINT' LIMIT 1;
    SELECT decrypted_secret INTO secret FROM vault.decrypted_secrets WHERE name = 'WEBHOOK_SECRET' LIMIT 1;

    -- Generate the payload
    payload = jsonb_build_object(
        'old_record', old,
        'record', new,
        'type', tg_op,
        'table', tg_table_name,
        'schema', tg_table_schema
    );

    -- Generate the signature
    signature = generate_hmac(secret, payload::text);

    -- Send the webhook request
    SELECT http_post
    INTO request_id
    FROM
        net.http_post(
                url :=  url || '/' || path,
                body := payload,
                headers := jsonb_build_object(
                        'Content-Type', 'application/json',
                        'X-Supabase-Signature', signature
                ),
               timeout_milliseconds := 3000
        );

    -- Insert the request ID into the Supabase hooks table
    INSERT INTO supabase_functions.hooks
        (hook_table_id, hook_name, request_id)
    VALUES (tg_relid, tg_name, request_id);

    RETURN new;
END;
$$;

ALTER FUNCTION "public"."webhook"() OWNER TO "postgres";

CREATE OR REPLACE TRIGGER "match_transaction" AFTER INSERT ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."webhook"('webhook/inbox/match');

GRANT ALL ON FUNCTION "public"."webhook"() TO "anon";
GRANT ALL ON FUNCTION "public"."webhook"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."webhook"() TO "service_role";

CREATE TRIGGER user_registered AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION webhook('webhook/registered');

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
    select string_to_array(name, '/') into _parts;
    select _parts[array_length(_parts,1)] into _filename;
    -- @todo return the last part instead of 2
    return split_part(_filename, '.', 2);
END
$function$
;

CREATE OR REPLACE FUNCTION storage.filename(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[array_length(_parts,1)];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[1:array_length(_parts,1)-1];
END
$function$
;

CREATE POLICY "Give members access to team folder 1oj01fe_0"
ON "storage"."objects"
AS permissive
FOR SELECT
TO public
USING (((bucket_id = 'avatars'::text) AND (EXISTS ( SELECT 1
   FROM users_on_team
  WHERE ((users_on_team.user_id = auth.uid()) AND ((users_on_team.team_id)::text = (storage.foldername(objects.name))[1]))))));


CREATE POLICY "Give members access to team folder 1oj01fe_1"
ON "storage"."objects"
AS permissive
FOR INSERT
TO public
WITH CHECK (((bucket_id = 'avatars'::text) AND (EXISTS ( SELECT 1
   FROM users_on_team
  WHERE ((users_on_team.user_id = auth.uid()) AND ((users_on_team.team_id)::text = (storage.foldername(objects.name))[1]))))));


CREATE POLICY "Give members access to team folder 1oj01fe_2"
ON "storage"."objects"
AS permissive
FOR UPDATE
TO public
USING (((bucket_id = 'avatars'::text) AND (EXISTS ( SELECT 1
   FROM users_on_team
  WHERE ((users_on_team.user_id = auth.uid()) AND ((users_on_team.team_id)::text = (storage.foldername(objects.name))[1]))))));


CREATE POLICY "Give members access to team folder 1oj01fe_3"
ON "storage"."objects"
AS permissive
FOR DELETE
TO public
USING (((bucket_id = 'avatars'::text) AND (EXISTS ( SELECT 1
   FROM users_on_team
  WHERE ((users_on_team.user_id = auth.uid()) AND ((users_on_team.team_id)::text = (storage.foldername(objects.name))[1]))))));


CREATE POLICY "Give members access to team folder 1uo56a_0"
ON "storage"."objects"
AS permissive
FOR SELECT
TO authenticated
USING (((bucket_id = 'vault'::text) AND (EXISTS ( SELECT 1
   FROM users_on_team
  WHERE ((users_on_team.user_id = auth.uid()) AND ((users_on_team.team_id)::text = (storage.foldername(objects.name))[1]))))));


CREATE POLICY "Give members access to team folder 1uo56a_1"
ON "storage"."objects"
AS permissive
FOR INSERT
TO authenticated
WITH CHECK (((bucket_id = 'vault'::text) AND (EXISTS ( SELECT 1
   FROM users_on_team
  WHERE ((users_on_team.user_id = auth.uid()) AND ((users_on_team.team_id)::text = (storage.foldername(objects.name))[1]))))));


CREATE POLICY "Give members access to team folder 1uo56a_2"
ON "storage"."objects"
AS permissive
FOR UPDATE
TO authenticated
USING (((bucket_id = 'vault'::text) AND (EXISTS ( SELECT 1
   FROM users_on_team
  WHERE ((users_on_team.user_id = auth.uid()) AND ((users_on_team.team_id)::text = (storage.foldername(objects.name))[1]))))));


CREATE POLICY "Give members access to team folder 1uo56a_3"
ON "storage"."objects"
AS permissive
FOR DELETE
TO authenticated
USING (((bucket_id = 'vault'::text) AND (EXISTS ( SELECT 1
   FROM users_on_team
  WHERE ((users_on_team.user_id = auth.uid()) AND ((users_on_team.team_id)::text = (storage.foldername(objects.name))[1]))))));


CREATE POLICY "Give users access to own folder 1oj01fe_0"
ON "storage"."objects"
AS permissive
FOR SELECT
TO authenticated
USING (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


CREATE POLICY "Give users access to own folder 1oj01fe_1"
ON "storage"."objects"
AS permissive
FOR INSERT
TO authenticated
WITH CHECK (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


CREATE POLICY "Give users access to own folder 1oj01fe_2"
ON "storage"."objects"
AS permissive
FOR UPDATE
TO authenticated
USING (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


CREATE POLICY "Give users access to own folder 1oj01fe_3"
ON "storage"."objects"
AS permissive
FOR DELETE
TO authenticated
USING (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


CREATE TRIGGER before_delete_objects BEFORE DELETE ON storage.objects FOR EACH ROW WHEN ((old.bucket_id = 'vault'::text)) EXECUTE FUNCTION delete_from_documents();

CREATE TRIGGER tr_lp225ozlnzx2 AFTER INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://cloud.trigger.dev/api/v1/sources/http/clz0yl7ai6652lp225ozlnzx2', 'POST', '{"Content-type":"application/json", "Authorization": "Bearer d8e3de5a468d1af4990e168c27e2b167e6911e93da67a7a8c9cf15b1dc2011dd" }', '{}', '1000');

CREATE TRIGGER vault_upload AFTER INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://cloud.trigger.dev/api/v1/sources/http/clxhxy07hfixvo93155n4t3bw', 'POST', '{"Content-type":"application/json","Authorization":"Bearer 45fe98e53abae5f592f97432da5d3e388b71bbfe3194aa1c82e02ed83af225e1"}', '{}', '3000');

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."inbox";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";

GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";
