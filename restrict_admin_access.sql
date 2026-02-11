-- Restrict Admin Access to Specific Email
-- Run this SQL in your Supabase SQL Editor
-- Replace 'your-admin-email@example.com' with your actual admin email

-- First, drop the old policies that allow all authenticated users
DROP POLICY IF EXISTS "Allow authenticated insert" ON updates;
DROP POLICY IF EXISTS "Allow authenticated update" ON updates;
DROP POLICY IF EXISTS "Allow authenticated delete" ON updates;

-- Create new policies that only allow the specific admin email
-- Replace 'your-admin-email@example.com' with your actual admin email address
CREATE POLICY "Only admin email can insert" ON updates
  FOR INSERT
  WITH CHECK (
    LOWER(auth.email()) = 'officialquickbite@gmail.com'
  );

CREATE POLICY "Only admin email can update" ON updates
  FOR UPDATE
  USING (
    LOWER(auth.email()) = 'officialquickbite@gmail.com'
  )
  WITH CHECK (
    LOWER(auth.email()) = 'officialquickbite@gmail.com'
  );

CREATE POLICY "Only admin email can delete" ON updates
  FOR DELETE
  USING (
    LOWER(auth.email()) = 'officialquickbite@gmail.com'
  );

-- Note: Public read access remains unchanged - anyone can still read updates
