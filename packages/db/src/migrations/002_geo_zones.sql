-- Geographic zones (neighborhoods, cities, provinces, countries)
CREATE TYPE geo_level AS ENUM ('neighborhood', 'city', 'province', 'country');

CREATE TABLE IF NOT EXISTS geo_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  level       geo_level NOT NULL,
  parent_id   UUID REFERENCES geo_zones(id) ON DELETE SET NULL,
  boundary    GEOMETRY(MultiPolygon, 4326),
  centroid    GEOMETRY(Point, 4326),
  country_code CHAR(2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial index for polygon queries
CREATE INDEX IF NOT EXISTS geo_zones_boundary_gist ON geo_zones USING GIST(boundary);
CREATE INDEX IF NOT EXISTS geo_zones_centroid_gist ON geo_zones USING GIST(centroid);

-- Trigram index for autocomplete search
CREATE INDEX IF NOT EXISTS geo_zones_name_trgm ON geo_zones USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS geo_zones_slug_trgm ON geo_zones USING GIN(slug gin_trgm_ops);

-- Ancestor index
CREATE INDEX IF NOT EXISTS geo_zones_parent_id_idx ON geo_zones(parent_id);

-- Closure table: precomputed ancestor paths
CREATE TABLE IF NOT EXISTS geo_zone_ancestors (
  zone_id     UUID NOT NULL REFERENCES geo_zones(id) ON DELETE CASCADE,
  ancestor_id UUID NOT NULL REFERENCES geo_zones(id) ON DELETE CASCADE,
  depth       INT NOT NULL CHECK (depth >= 0),
  PRIMARY KEY (zone_id, ancestor_id)
);

CREATE INDEX IF NOT EXISTS geo_zone_ancestors_ancestor_idx ON geo_zone_ancestors(ancestor_id);

-- Function to populate closure table for a new zone
CREATE OR REPLACE FUNCTION generate_ancestors_for_zone(p_zone_id UUID)
RETURNS void AS $$
DECLARE
  v_parent_id UUID;
  v_depth INT := 1;
  v_current_id UUID;
BEGIN
  -- Self-reference at depth 0
  INSERT INTO geo_zone_ancestors (zone_id, ancestor_id, depth)
  VALUES (p_zone_id, p_zone_id, 0)
  ON CONFLICT DO NOTHING;

  SELECT parent_id INTO v_parent_id FROM geo_zones WHERE id = p_zone_id;
  v_current_id := v_parent_id;

  WHILE v_current_id IS NOT NULL LOOP
    INSERT INTO geo_zone_ancestors (zone_id, ancestor_id, depth)
    VALUES (p_zone_id, v_current_id, v_depth)
    ON CONFLICT DO NOTHING;
    v_depth := v_depth + 1;
    SELECT parent_id INTO v_current_id FROM geo_zones WHERE id = v_current_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-populate ancestors on zone insert
CREATE OR REPLACE FUNCTION trg_auto_generate_ancestors()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generate_ancestors_for_zone(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_geo_zone_ancestors
AFTER INSERT ON geo_zones
FOR EACH ROW EXECUTE FUNCTION trg_auto_generate_ancestors();
