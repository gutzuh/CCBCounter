import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase variables not set. Copy `.env.example` to `.env` and fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Supabase functionality will be disabled locally.');

  const noop = () => ({
    from: () => ({
      select: async () => ({ data: null, error: null }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
    }),
    channel: () => ({ subscribe: async () => ({}) }),
    removeChannel: () => {},
  });

  supabaseClient = noop();
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
