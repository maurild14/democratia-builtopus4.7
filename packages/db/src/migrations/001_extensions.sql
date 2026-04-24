-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create text search configuration with unaccent
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS public.unaccent_config (COPY = pg_catalog.english);
ALTER TEXT SEARCH CONFIGURATION public.unaccent_config ALTER MAPPING FOR hword, hword_part, word WITH unaccent, english_stem;
