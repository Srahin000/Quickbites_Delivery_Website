-- QuickBites Updates Table Setup
-- Run this SQL in your Supabase SQL Editor

-- Create the updates table
CREATE TABLE IF NOT EXISTS updates (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read updates (public access)
CREATE POLICY "Allow public read access" ON updates
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert updates
-- Note: Since we're using password-based auth at app level,
-- we'll allow inserts from anon key but protect with app-level password
CREATE POLICY "Allow authenticated insert" ON updates
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to update updates
CREATE POLICY "Allow authenticated update" ON updates
  FOR UPDATE
  USING (true);

-- Create policy to allow authenticated users to delete updates
CREATE POLICY "Allow authenticated delete" ON updates
  FOR DELETE
  USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row update
CREATE TRIGGER update_updates_updated_at BEFORE UPDATE ON updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Insert a sample update (you can delete this after testing)
-- INSERT INTO updates (title, content, category, featured)
-- VALUES (
--   '🚀 Beta Launch - QuickBites is Coming October 1st!',
--   '🚧 QuickBites Beta Launch - October 1st! We''re thrilled to share that QuickBites is officially opening its doors in beta this fall. This is the first step in bringing a faster, more affordable, and student-focused food delivery experience to CCNY. During this phase, we''ll be testing our systems, learning from real orders, and working closely with students to make QuickBites the best it can be. Think of it as getting a sneak peek at what''s to come — and your feedback will directly shape how we grow. Stay tuned here for live updates, new features, and ways to get involved as we build this service together.',
--   'Launch',
--   true
-- );
