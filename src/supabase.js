import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pgouwzuufnnhthwrewrv.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnb3V3enV1Zm5uaHRod3Jld3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzc4NjksImV4cCI6MjA2MDYxMzg2OX0.ObVZe7UHaOQOcY7E_HUDc_Wo8b5Ei3gI1EaW8AC9rfk'

// Debug logging
console.log('Environment variables:');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Final supabaseUrl:', supabaseUrl);
console.log('Final supabaseAnonKey:', supabaseAnonKey ? 'Present' : 'Missing');

// Check if we have valid credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  console.error('Required variables: REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
