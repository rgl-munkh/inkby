-- Enable Row Level Security on all application tables.
--
-- Rationale: NEXT_PUBLIC_SUPABASE_URL and the anon key are public, so PostgREST
-- is reachable by anyone. With RLS disabled, the anon/authenticated roles can
-- read and write these tables directly, bypassing the application's API and
-- authorization checks entirely.
--
-- All legitimate data access in this app flows through server routes that
-- connect either via the Drizzle DATABASE_URL (the table-owning `postgres`
-- role) or the Supabase service_role key. Both BYPASS RLS, so enabling RLS with
-- a default-deny posture (no permissive policies) locks down direct PostgREST
-- access without affecting the API. We intentionally do NOT use FORCE ROW LEVEL
-- SECURITY, so the owning role retains its bypass.
--
-- If/when client-side direct table reads are introduced (e.g. an authenticated
-- artist querying their own rows via the browser client), add scoped policies
-- here, e.g.:
--   CREATE POLICY "artist_owns_row" ON public.appointments
--     FOR SELECT TO authenticated USING (artist_id = auth.uid());

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
  END LOOP;
END $$;
