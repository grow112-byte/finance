import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env setup.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Default config uses window.localStorage natively which is appropriate for a web app.
    persistSession: true,
    autoRefreshToken: true,
  },
});
