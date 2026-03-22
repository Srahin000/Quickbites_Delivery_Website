-- Run this if you already ran club_partner_dashboard_migration.sql but skipped partners_setup.sql
--
-- DO NOT run the "clubs" policies section from partners_setup.sql afterward — that would re-open
-- anonymous SELECT on public.clubs and expose dashboard_password_hash.

-- 1. partners table (required by register_partner_organization + dashboard)
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  organization text NOT NULL,
  email text NOT NULL,
  phone text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT partners_pkey PRIMARY KEY (id)
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert on partners" ON public.partners;
CREATE POLICY "Allow anonymous insert on partners"
  ON public.partners FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous select on partners" ON public.partners;
CREATE POLICY "Allow anonymous select on partners"
  ON public.partners FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. club_orders: dashboard lists orders (anon SELECT)
ALTER TABLE public.club_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous select on club_orders" ON public.club_orders;
CREATE POLICY "Allow anonymous select on club_orders"
  ON public.club_orders FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. coupons insert (optional if you insert coupons from elsewhere; RPC uses SECURITY DEFINER)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Allow anonymous insert on coupons'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow anonymous insert on coupons" ON public.coupons FOR INSERT TO anon, authenticated WITH CHECK (true)';
  END IF;
END $$;

-- 4. Keep clubs.total_earned in sync when mobile inserts club_orders
-- SECURITY DEFINER: RLS on public.clubs has no UPDATE policy for anon/authenticated; without this,
-- the trigger would run as the invoker and the UPDATE on clubs would match zero rows / be denied.
CREATE OR REPLACE FUNCTION public.update_club_total_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.clubs
  SET total_earned = COALESCE(total_earned, 0) + NEW.commission_amount
  WHERE id = NEW.club_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_club_total_earned ON public.club_orders;
CREATE TRIGGER trg_update_club_total_earned
  AFTER INSERT ON public.club_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_club_total_earned();
