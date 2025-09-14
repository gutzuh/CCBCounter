import { createClient } from '@supabase/supabase-js';
// importar o process pq da erro no frontend
import process from 'process';

var supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const developmentUrl = "https://psaudbsbvtbrmmkwdlgs.supabase.co";
const developmentAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYXVkYnNidnRicm1ta3dkbGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0ODU5NzgsImV4cCI6MjA3MzA2MTk3OH0.AoeoAgkYG8YXxCbrYKXQzthG8cT2nxyWqprEcToXRLA";
if (!supabaseUrl || !supabaseAnonKey) {
  if (developmentUrl && developmentAnonKey) {
    // console.warn('Missing Supabase environment variables, but continuing in development mode.');
    supabaseUrl = developmentUrl;
    supabaseAnonKey = developmentAnonKey;
  } else {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
  }
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
