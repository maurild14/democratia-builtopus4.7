-- Statement source
CREATE TYPE statement_source AS ENUM ('ai_extracted', 'user_proposed');
CREATE TYPE statement_status AS ENUM ('active', 'pending', 'rejected');
CREATE TYPE appeal_status AS ENUM ('none', 'pending', 'upheld', 'dismissed');

-- Statements (Layer 2)
CREATE TABLE IF NOT EXISTS statements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id         UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  text              TEXT NOT NULL CHECK (char_length(text) BETWEEN 10 AND 500),
  source            statement_source NOT NULL DEFAULT 'ai_extracted',
  proposed_by       UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  status            statement_status NOT NULL DEFAULT 'active',
  endorsement_count INT NOT NULL DEFAULT 0 CHECK (endorsement_count >= 0),
  vote_agree        INT NOT NULL DEFAULT 0 CHECK (vote_agree >= 0),
  vote_disagree     INT NOT NULL DEFAULT 0 CHECK (vote_disagree >= 0),
  vote_pass         INT NOT NULL DEFAULT 0 CHECK (vote_pass >= 0),
  cluster_id        INT,
  is_consensus      BOOLEAN NOT NULL DEFAULT false,
  is_divisive       BOOLEAN NOT NULL DEFAULT false,
  consensus_score   NUMERIC,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS statements_thread_id_idx ON statements(thread_id);
CREATE INDEX IF NOT EXISTS statements_status_idx ON statements(status);

-- Deliberation results (Layers 3-5)
CREATE TABLE IF NOT EXISTS deliberation_results (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id      UUID NOT NULL UNIQUE REFERENCES threads(id) ON DELETE CASCADE,
  cluster_data   JSONB,  -- scatter plot coordinates, centroids, cluster labels
  synthesis_text TEXT,   -- Layer 4 Habermas synthesis
  dissent_text   TEXT,   -- Layer 4 minority voices
  proposals      JSONB,  -- Layer 5 structured proposals
  metrics        JSONB,  -- participation stats, agreement rates
  executive_summary TEXT,
  open_data_url  TEXT,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Forum access function
CREATE OR REPLACE FUNCTION user_forum_access(
  p_user_id UUID,
  p_forum_id UUID
) RETURNS TABLE(has_access BOOLEAN, is_resident BOOLEAN, weight NUMERIC) AS $$
DECLARE
  v_forum_zone_id UUID;
  v_primary_zone_id UUID;
  v_secondary_zone_id UUID;
  v_secondary_weight NUMERIC;
BEGIN
  SELECT geo_zone_id INTO v_forum_zone_id FROM forums WHERE id = p_forum_id;
  SELECT primary_zone_id INTO v_primary_zone_id FROM user_profiles WHERE id = p_user_id;

  -- Check primary zone (weight 1.0)
  IF EXISTS (
    SELECT 1 FROM geo_zone_ancestors
    WHERE zone_id = v_primary_zone_id AND ancestor_id = v_forum_zone_id
  ) OR v_primary_zone_id = v_forum_zone_id THEN
    RETURN QUERY SELECT true, true, 1.0::NUMERIC;
    RETURN;
  END IF;

  -- Check secondary zones
  SELECT geo_zone_id, weight INTO v_secondary_zone_id, v_secondary_weight
  FROM user_secondary_zones
  WHERE user_id = p_user_id
    AND EXISTS (
      SELECT 1 FROM geo_zone_ancestors
      WHERE zone_id = geo_zone_id AND ancestor_id = v_forum_zone_id
    )
  LIMIT 1;

  IF v_secondary_zone_id IS NOT NULL THEN
    RETURN QUERY SELECT true, false, v_secondary_weight;
    RETURN;
  END IF;

  -- Check if forum is at a higher level (city, province, country) of user's primary
  IF EXISTS (
    SELECT 1 FROM geo_zone_ancestors
    WHERE zone_id = v_primary_zone_id AND ancestor_id = v_forum_zone_id
  ) THEN
    RETURN QUERY SELECT true, false, 0.75::NUMERIC;
    RETURN;
  END IF;

  RETURN QUERY SELECT false, false, 0.0::NUMERIC;
END;
$$ LANGUAGE plpgsql STABLE;
