-- Partners Setup SQL
-- Run this in your Supabase SQL Editor

-- 1. Create partners table to store contact info
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

-- 2. Enable RLS on partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (partner registration form is public)
CREATE POLICY "Allow anonymous insert on partners"
  ON public.partners FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow reading partner data by anyone (needed for dashboard lookup)
CREATE POLICY "Allow anonymous select on partners"
  ON public.partners FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. RLS policies for clubs table (if not already set)
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert on clubs"
  ON public.clubs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select on clubs"
  ON public.clubs FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. RLS policies for club_orders (read access for dashboard)
ALTER TABLE public.club_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous select on club_orders"
  ON public.club_orders FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. RLS policies for coupons (insert for partner code creation)
-- Only add if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Allow anonymous insert on coupons'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow anonymous insert on coupons" ON public.coupons FOR INSERT TO anon, authenticated WITH CHECK (true)';
  END IF;
END $$;

-- 6. Function to update clubs.total_earned when club_orders are inserted
CREATE OR REPLACE FUNCTION update_club_total_earned()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.clubs
  SET total_earned = COALESCE(total_earned, 0) + NEW.commission_amount
  WHERE id = NEW.club_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_club_total_earned ON public.club_orders;
CREATE TRIGGER trg_update_club_total_earned
  AFTER INSERT ON public.club_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_club_total_earned();
