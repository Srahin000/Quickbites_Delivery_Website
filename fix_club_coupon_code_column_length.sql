-- Fix: 22001 "value too long for type character varying(4)"
-- Partner codes are 5 letters; widen columns if your DB still uses varchar(4).

ALTER TABLE public.clubs
  ALTER COLUMN club_code TYPE text USING club_code::text;

ALTER TABLE public.coupons
  ALTER COLUMN coupon_code TYPE text USING coupon_code::text;

-- Safer if category was varchar(4): RPC used to insert 'partner' (7 chars).
ALTER TABLE public.coupons
  ALTER COLUMN category TYPE text USING category::text;
