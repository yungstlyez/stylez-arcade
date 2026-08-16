/**
 * TODO(supabase): install @supabase/supabase-js and wire this to
 * NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * Player save data currently lives in localStorage so the world
 * can ship without accounts. This client is the future home for
 * synced profiles, leaderboards, collectibles, and Chronicle drafts.
 */

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  // TODO(supabase): return createBrowserClient(...)
  return null;
}
