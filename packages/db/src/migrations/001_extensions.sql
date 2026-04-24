-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create text search configuration with unaccent (IF NOT EXISTS not supported for TSC, use DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_ts_config WHERE cfgname = 'unaccent_config' AND cfgnamespace = 'public'::regnamespace
  ) THEN
    CREATE TEXT SEARCH CONFIGURATION public.unaccent_config (COPY = pg_catalog.english);
    ALTER TEXT SEARCH CONFIGURATION public.unaccent_config ALTER MAPPING FOR hword, hword_part, word WITH unaccent, english_stem;
  END IF;
END;
$$;
