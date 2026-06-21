-- Reschedule & cancellation: per-artist policy + appointment audit fields

ALTER TABLE "artists"
  ADD COLUMN IF NOT EXISTS "cancellation_notice_hours" integer NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS "max_reschedules" integer NOT NULL DEFAULT 2;

ALTER TABLE "appointments"
  ADD COLUMN IF NOT EXISTS "reschedule_count" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "previous_datetime" timestamptz,
  ADD COLUMN IF NOT EXISTS "cancelled_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "cancelled_by" text,
  ADD COLUMN IF NOT EXISTS "cancellation_reason" text;
