-- Create transaction_frequency enum if it doesn't exist
CREATE TYPE "public"."transaction_frequency" AS ENUM (
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly'
);

ALTER TYPE "public"."transaction_frequency" OWNER TO "postgres";

-- Create invoice status enum
CREATE TYPE "public"."invoice_status" AS ENUM (
    'draft',
    'sent',
    'paid',
    'overdue',
    'cancelled'
);

ALTER TYPE "public"."invoice_status" OWNER TO "postgres";

-- Create customers table
CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "team_id" uuid NOT NULL,
    "name" text NOT NULL,
    "email" text,
    "phone" text,
    "address" text,
    "city" text,
    "state" text,
    "country" text,
    "postal_code" text,
    "vat_number" text,
    "notes" text,
    "website" text,
    "currency" text,
    "language" text DEFAULT 'en',
    CONSTRAINT "customers_pkey" PRIMARY KEY (id)
);

-- Enable RLS for customers
ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;

-- Create customer indexes
CREATE INDEX customers_team_id_idx ON public.customers USING btree (team_id);
CREATE INDEX customers_email_idx ON public.customers USING btree (email);

-- Add customer foreign key constraints
ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_team_id_fkey" 
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Add customer RLS policies
CREATE POLICY "Customers can be created by team members" ON "public"."customers"
    FOR INSERT TO authenticated
    WITH CHECK (team_id IN (SELECT private.get_teams_for_authenticated_user()));

CREATE POLICY "Customers can be viewed by team members" ON "public"."customers"
    FOR SELECT TO authenticated
    USING (team_id IN (SELECT private.get_teams_for_authenticated_user()));

CREATE POLICY "Customers can be updated by team members" ON "public"."customers"
    FOR UPDATE TO authenticated
    USING (team_id IN (SELECT private.get_teams_for_authenticated_user()));

CREATE POLICY "Customers can be deleted by team members" ON "public"."customers"
    FOR DELETE TO authenticated
    USING (team_id IN (SELECT private.get_teams_for_authenticated_user()));

-- Create invoice table
CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "team_id" uuid NOT NULL,
    "customer_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "amount" numeric NOT NULL,
    "currency" text NOT NULL,
    "base_amount" numeric,
    "base_currency" text,
    "status" invoice_status DEFAULT 'draft'::invoice_status NOT NULL,
    "due_date" date NOT NULL,
    "issue_date" date NOT NULL,
    "paid_at" timestamp with time zone,
    "viewed_at" timestamp with time zone,
    "sent_to" text,
    "invoice_number" text NOT NULL,
    "vat" numeric DEFAULT 0,
    "tax" numeric DEFAULT 0,
    "internal_note" text,
    "template" text DEFAULT 'default',
    "file_path" text[],
    "file_size" bigint,
    "recurring" boolean DEFAULT false,
    "frequency" transaction_frequency,
    "next_date" date,
    "token" text DEFAULT nanoid(32),
    CONSTRAINT "invoices_pkey" PRIMARY KEY (id)
);

-- Enable RLS for invoices
ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;

-- Add invoice indexes
CREATE INDEX invoices_team_id_idx ON public.invoices USING btree (team_id);
CREATE INDEX invoices_customer_id_idx ON public.invoices USING btree (customer_id);
CREATE INDEX invoices_user_id_idx ON public.invoices USING btree (user_id);
CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);
CREATE INDEX invoices_due_date_idx ON public.invoices USING btree (due_date);

-- Add invoice foreign key constraints
ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_team_id_fkey" 
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_customer_id_fkey" 
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_user_id_fkey" 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add invoice RLS policies
CREATE POLICY "Invoices can be created by team members" ON "public"."invoices"
    FOR INSERT TO authenticated
    WITH CHECK (team_id IN (SELECT private.get_teams_for_authenticated_user()));

CREATE POLICY "Invoices can be viewed by team members" ON "public"."invoices"
    FOR SELECT TO authenticated
    USING (team_id IN (SELECT private.get_teams_for_authenticated_user()));

CREATE POLICY "Invoices can be updated by team members" ON "public"."invoices"
    FOR UPDATE TO authenticated
    USING (team_id IN (SELECT private.get_teams_for_authenticated_user()));

CREATE POLICY "Invoices can be deleted by team members" ON "public"."invoices"
    FOR DELETE TO authenticated
    USING (team_id IN (SELECT private.get_teams_for_authenticated_user()));

-- Create function to calculate base amount
CREATE OR REPLACE FUNCTION public.calculate_invoice_base_amount()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
declare
    team_base_currency text;
    exchange_rate numeric;
begin
    select base_currency into team_base_currency
    from teams
    where id = new.team_id;

    if new.currency = team_base_currency or team_base_currency is null then
        new.base_amount := new.amount;
        new.base_currency := new.currency;
    else
        select rate into exchange_rate
        from exchange_rates
        where base = new.currency
        and target = team_base_currency
        limit 1;

        if exchange_rate is null then
            raise log 'Exchange rate not found for % to %', new.currency, team_base_currency;
            new.base_amount := new.amount;
            new.base_currency := new.currency;
            return new;
        end if;

        new.base_amount := round(new.amount * exchange_rate, 2);
        new.base_currency := team_base_currency;
    end if;

    return new;
exception
    when others then
        raise log 'Error in calculate_invoice_base_amount: %', sqlerrm;
        new.base_amount := new.amount;
        new.base_currency := new.currency;
        return new;
end;
$function$;

-- Add triggers
CREATE TRIGGER calculate_invoice_base_amount_before_insert
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION calculate_invoice_base_amount();

CREATE TRIGGER calculate_invoice_base_amount_before_update
    BEFORE UPDATE OF amount ON public.invoices
    FOR EACH ROW WHEN (OLD.amount IS DISTINCT FROM NEW.amount)
    EXECUTE FUNCTION calculate_invoice_base_amount();

CREATE TRIGGER set_invoice_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_customer_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();