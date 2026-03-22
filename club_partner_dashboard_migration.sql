-- Club partner dashboard migration
-- Run in Supabase SQL Editor
--
-- If you run this WITHOUT partners_setup.sql first, run partners_prereqs_only.sql afterward
-- (partners table, club_orders RLS, total_earned trigger). Do not re-add open SELECT on clubs.
--
-- Adds dashboard password (bcrypt) on clubs, 3% commission for new registrations,
-- and RPCs so the website never exposes password hashes via public SELECT on clubs.
--
-- Mobile / backend: when a user applies a club code at checkout, insert into club_orders with
-- commission_percentage = 3 and commission_amount = round(subtotal * 0.03, 2) where subtotal is
-- order food/items total excluding tax and delivery fees. The trigger on club_orders updates
-- clubs.total_earned.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Five-letter partner codes require more than varchar(4) if the table was created that way.
ALTER TABLE public.clubs
  ALTER COLUMN club_code TYPE text USING club_code::text;

ALTER TABLE public.coupons
  ALTER COLUMN coupon_code TYPE text USING coupon_code::text;

ALTER TABLE public.coupons
  ALTER COLUMN category TYPE text USING category::text;

ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS dashboard_password_hash text;

COMMENT ON COLUMN public.clubs.dashboard_password_hash IS 'bcrypt hash for partner dashboard login; never expose via client SELECT.';

-- ─── Replace open clubs policies with RPC-only access for new registrations ───
DROP POLICY IF EXISTS "Allow anonymous insert on clubs" ON public.clubs;
DROP POLICY IF EXISTS "Allow anonymous select on clubs" ON public.clubs;

-- Direct table access from the anon key is denied; SECURITY DEFINER RPCs perform inserts/selects.

CREATE OR REPLACE FUNCTION public.register_partner_organization(
  p_club_code text,
  p_club_name text,
  p_dashboard_password text,
  p_contact_name text,
  p_organization text,
  p_email text,
  p_phone text,
  p_description text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_code text;
  new_club_id uuid;
BEGIN
  v_code := upper(trim(p_club_code));
  IF v_code !~ '^[A-Z]{5}$' THEN
    RAISE EXCEPTION 'invalid_club_code';
  END IF;
  IF length(trim(p_dashboard_password)) < 8 THEN
    RAISE EXCEPTION 'weak_password';
  END IF;

  INSERT INTO public.clubs (
    club_code,
    club_name,
    commission_percentage,
    total_earned,
    is_active,
    dashboard_password_hash
  )
  VALUES (
    v_code,
    trim(p_club_name),
    3,
    0,
    true,
    extensions.crypt(trim(p_dashboard_password), extensions.gen_salt('bf'))
  )
  RETURNING id INTO new_club_id;

  INSERT INTO public.partners (club_id, contact_name, organization, email, phone, description)
  VALUES (
    new_club_id,
    trim(p_contact_name),
    trim(p_organization),
    trim(p_email),
    NULLIF(trim(p_phone), ''),
    NULLIF(trim(p_description), '')
  );

  INSERT INTO public.coupons (coupon_code, percentage, valid, category, max_usage, categories)
  VALUES (v_code, 10, true, 'club', 9999, 'delivery-fee');

  RETURN jsonb_build_object('club_id', new_club_id, 'club_code', v_code);
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'duplicate_club_code';
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_club_dashboard_access(
  p_club_code text,
  p_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  r clubs%ROWTYPE;
BEGIN
  SELECT * INTO r
  FROM public.clubs
  WHERE club_code = upper(trim(p_club_code)) AND is_active = true;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF r.dashboard_password_hash IS NULL OR length(r.dashboard_password_hash) < 10 THEN
    RETURN NULL;
  END IF;

  IF extensions.crypt(trim(p_password), r.dashboard_password_hash) <> r.dashboard_password_hash THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', r.id,
    'club_code', r.club_code,
    'club_name', r.club_name,
    'commission_percentage', r.commission_percentage,
    'total_earned', r.total_earned,
    'is_active', r.is_active,
    'last_payout_date', r.last_payout_date
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_partner_organization(text, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_club_dashboard_access(text, text) TO anon, authenticated;

-- If clubs has RLS and no UPDATE policy for anon/authenticated, the total_earned trigger must bypass RLS:
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
