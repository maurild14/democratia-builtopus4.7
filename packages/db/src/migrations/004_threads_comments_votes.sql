-- Deliberation stages
CREATE TYPE deliberation_stage AS ENUM ('layer1', 'layer2', 'layer3', 'layer4', 'layer5');

-- Moderation status
CREATE TYPE moderation_status AS ENUM ('visible', 'offtopic', 'removed');

-- Vote values
CREATE TYPE vote_value AS ENUM ('agree', 'disagree', 'pass');

-- Vote target types
CREATE TYPE vote_target_type AS ENUM ('thread', 'comment', 'statement');

-- Threads
CREATE TABLE IF NOT EXISTS threads (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id                UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  author_id               UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  title                   TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 300),
  body                    TEXT NOT NULL CHECK (char_length(body) >= 10),
  image_urls              TEXT[] DEFAULT '{}',
  link_preview_url        TEXT,
  link_preview_title      TEXT,
  link_preview_image      TEXT,
  vote_agree              INT NOT NULL DEFAULT 0 CHECK (vote_agree >= 0),
  vote_disagree           INT NOT NULL DEFAULT 0 CHECK (vote_disagree >= 0),
  vote_pass               INT NOT NULL DEFAULT 0 CHECK (vote_pass >= 0),
  comment_count           INT NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  hot_score               NUMERIC NOT NULL DEFAULT 0,
  is_deliberation         BOOLEAN NOT NULL DEFAULT false,
  deliberation_stage      deliberation_stage,
  deliberation_started_at TIMESTAMPTZ,
  radar_item_id           UUID,
  moderation_status       moderation_status NOT NULL DEFAULT 'visible',
  edited_at               TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS threads_forum_id_idx ON threads(forum_id);
CREATE INDEX IF NOT EXISTS threads_author_id_idx ON threads(author_id);
CREATE INDEX IF NOT EXISTS threads_hot_score_idx ON threads(hot_score DESC);
CREATE INDEX IF NOT EXISTS threads_created_at_idx ON threads(created_at DESC);
CREATE INDEX IF NOT EXISTS threads_deliberation_idx ON threads(is_deliberation) WHERE is_deliberation = true;

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id         UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id         UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  parent_id         UUID REFERENCES comments(id) ON DELETE SET NULL,
  depth             INT NOT NULL DEFAULT 0 CHECK (depth BETWEEN 0 AND 5),
  reply_to_pseudonym TEXT,
  body              TEXT NOT NULL CHECK (char_length(body) >= 1),
  vote_agree        INT NOT NULL DEFAULT 0 CHECK (vote_agree >= 0),
  vote_disagree     INT NOT NULL DEFAULT 0 CHECK (vote_disagree >= 0),
  vote_pass         INT NOT NULL DEFAULT 0 CHECK (vote_pass >= 0),
  moderation_status moderation_status NOT NULL DEFAULT 'visible',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_thread_id_idx ON comments(thread_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments(parent_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON comments(author_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at);

-- Unified votes table
CREATE TABLE IF NOT EXISTS votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  target_type vote_target_type NOT NULL,
  target_id   UUID NOT NULL,
  value       vote_value NOT NULL,
  user_weight NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (user_weight IN (1.0, 0.75, 0.50)),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS votes_target_idx ON votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS votes_user_id_idx ON votes(user_id);

-- Hot score function
CREATE OR REPLACE FUNCTION calculate_hot_score(
  p_agree INT,
  p_disagree INT,
  p_pass INT,
  p_comment_count INT,
  p_created_at TIMESTAMPTZ
) RETURNS NUMERIC AS $$
DECLARE
  v_total_engagement NUMERIC;
  v_age_hours NUMERIC;
BEGIN
  v_total_engagement := p_agree + p_disagree + p_pass + (p_comment_count * 2);
  v_age_hours := GREATEST(EXTRACT(EPOCH FROM (now() - p_created_at)) / 3600, 0.1);
  RETURN v_total_engagement / POWER(v_age_hours + 2, 1.8);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Upsert vote with counter updates
CREATE OR REPLACE FUNCTION upsert_vote(
  p_user_id UUID,
  p_target_type vote_target_type,
  p_target_id UUID,
  p_value vote_value,
  p_weight NUMERIC
) RETURNS TABLE(agree INT, disagree INT, pass INT) AS $$
DECLARE
  v_old_value vote_value;
BEGIN
  SELECT value INTO v_old_value
  FROM votes
  WHERE user_id = p_user_id AND target_type = p_target_type AND target_id = p_target_id;

  INSERT INTO votes (user_id, target_type, target_id, value, user_weight)
  VALUES (p_user_id, p_target_type, p_target_id, p_value, p_weight)
  ON CONFLICT (user_id, target_type, target_id)
  DO UPDATE SET value = p_value, user_weight = p_weight;

  IF p_target_type = 'thread' THEN
    UPDATE threads SET
      vote_agree    = vote_agree    + CASE WHEN p_value = 'agree'    THEN 1 ELSE 0 END
                                    - CASE WHEN v_old_value = 'agree'    THEN 1 ELSE 0 END,
      vote_disagree = vote_disagree + CASE WHEN p_value = 'disagree' THEN 1 ELSE 0 END
                                    - CASE WHEN v_old_value = 'disagree' THEN 1 ELSE 0 END,
      vote_pass     = vote_pass     + CASE WHEN p_value = 'pass'     THEN 1 ELSE 0 END
                                    - CASE WHEN v_old_value = 'pass'     THEN 1 ELSE 0 END,
      hot_score = calculate_hot_score(
        vote_agree + CASE WHEN p_value = 'agree' THEN 1 ELSE 0 END - CASE WHEN v_old_value = 'agree' THEN 1 ELSE 0 END,
        vote_disagree + CASE WHEN p_value = 'disagree' THEN 1 ELSE 0 END - CASE WHEN v_old_value = 'disagree' THEN 1 ELSE 0 END,
        vote_pass + CASE WHEN p_value = 'pass' THEN 1 ELSE 0 END - CASE WHEN v_old_value = 'pass' THEN 1 ELSE 0 END,
        comment_count,
        created_at
      )
    WHERE id = p_target_id
    RETURNING vote_agree, vote_disagree, vote_pass INTO agree, disagree, pass;
  ELSIF p_target_type = 'comment' THEN
    UPDATE comments SET
      vote_agree    = vote_agree    + CASE WHEN p_value = 'agree'    THEN 1 ELSE 0 END
                                    - CASE WHEN v_old_value = 'agree'    THEN 1 ELSE 0 END,
      vote_disagree = vote_disagree + CASE WHEN p_value = 'disagree' THEN 1 ELSE 0 END
                                    - CASE WHEN v_old_value = 'disagree' THEN 1 ELSE 0 END,
      vote_pass     = vote_pass     + CASE WHEN p_value = 'pass'     THEN 1 ELSE 0 END
                                    - CASE WHEN v_old_value = 'pass'     THEN 1 ELSE 0 END
    WHERE id = p_target_id
    RETURNING vote_agree, vote_disagree, vote_pass INTO agree, disagree, pass;
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Trigger: increment comment_count on thread when comment is added
CREATE OR REPLACE FUNCTION trg_increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads
  SET comment_count = comment_count + 1,
      hot_score = calculate_hot_score(vote_agree, vote_disagree, vote_pass, comment_count + 1, created_at)
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comment_count
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION trg_increment_comment_count();

-- Trigger: increment thread_count on forum when thread is added
CREATE OR REPLACE FUNCTION trg_increment_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forums SET thread_count = thread_count + 1 WHERE id = NEW.forum_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_thread_count
AFTER INSERT ON threads
FOR EACH ROW EXECUTE FUNCTION trg_increment_thread_count();
