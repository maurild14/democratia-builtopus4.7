-- Helper RPC for the geo seed script.
-- PostgREST cannot pass raw GeoJSON into a PostGIS geometry column, so this
-- function accepts jsonb and calls ST_GeomFromGeoJSON internally.
-- SECURITY DEFINER bypasses RLS (safe for seeding; only callable via service role key).

CREATE OR REPLACE FUNCTION upsert_geo_zone(
  p_name             text,
  p_slug             text,
  p_level            text,
  p_parent_id        uuid,
  p_geojson_boundary jsonb,
  p_country_code     text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO geo_zones (name, slug, level, parent_id, boundary, centroid, country_code)
  VALUES (
    p_name,
    p_slug,
    p_level::geo_level,
    p_parent_id,
    CASE WHEN p_geojson_boundary IS NOT NULL
      THEN ST_GeomFromGeoJSON(p_geojson_boundary::text)
    END,
    CASE WHEN p_geojson_boundary IS NOT NULL
      THEN ST_Centroid(ST_GeomFromGeoJSON(p_geojson_boundary::text))
    END,
    p_country_code
  )
  ON CONFLICT (slug) DO UPDATE SET
    name       = EXCLUDED.name,
    boundary   = COALESCE(EXCLUDED.boundary, geo_zones.boundary),
    centroid   = COALESCE(EXCLUDED.centroid, geo_zones.centroid),
    parent_id  = COALESCE(EXCLUDED.parent_id, geo_zones.parent_id)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
