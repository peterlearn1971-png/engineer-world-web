import { createClient } from "@supabase/supabase-js";

// 1. Force strip any invisible spaces or line breaks from Vercel's environment variables
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://missing-url.supabase.co").trim();
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "missing-key").trim();

if (url === "https://missing-url.supabase.co" || anon === "missing-key") {
  console.warn("⚠️ Supabase env variables are NOT loading into the app.");
}

// 2. Your custom browser storage setup
function getBrowserStorage() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

// 3. Your Supabase initialization
export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "insureworld-auth",
    storage: getBrowserStorage(),
  },
});