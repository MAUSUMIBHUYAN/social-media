import { createClient } from "@supabase/supabase-js";

const supabaseURL = "https://utoxeyukiyedgtphuauc.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseURL, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,      // Automatically refresh JWT when needed
    persistSession: true,        // Store session in localStorage
    detectSessionInUrl: true,    // Handle OAuth redirect URLs
  },
});
