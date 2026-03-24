import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id') && 
  !supabaseAnonKey.includes('your-anon-public-key') &&
  supabaseUrl !== 'your-supabase-url' && 
  supabaseAnonKey !== 'your-supabase-anon-key';

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing or invalid. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

// Ensure the URL is valid to prevent top-level crash
const sanitizedUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
const sanitizedKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(sanitizedUrl, sanitizedKey);


