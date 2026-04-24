-- Radar item types
CREATE TYPE radar_item_type AS ENUM ('law', 'decree', 'budget', 'report', 'resolution', 'other');

-- Civic Radar items
CREATE TABLE IF NOT EXISTS radar_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id              UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  item_type             radar_item_type NOT NULL DEFAULT 'other',
  title                 TEXT NOT NULL,
  source_url            TEXT,
  source_name           TEXT,
  original_text         TEXT,
  ai_summary            TEXT,
  published_at          TIMESTAMPTZ,
  is_debate_open        BOOLEAN NOT NULL DEFAULT false,
  linked_thread_id      UUID REFERENCES threads(id) ON DELETE SET NULL,
  summary_error_reports INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS radar_items_forum_id_idx ON radar_items(forum_id);
CREATE INDEX IF NOT EXISTS radar_items_type_idx ON radar_items(item_type);
CREATE INDEX IF NOT EXISTS radar_items_created_at_idx ON radar_items(created_at DESC);

-- Reports
CREATE TYPE report_type AS ENUM ('deliberative', 'periodic');

CREATE TABLE IF NOT EXISTS reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id         UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  thread_id        UUID REFERENCES threads(id) ON DELETE SET NULL,
  report_type      report_type NOT NULL,
  title            TEXT NOT NULL,
  executive_summary TEXT,
  full_content     TEXT,
  open_data_url    TEXT,
  distribution     JSONB DEFAULT '{}',
  is_public        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_forum_id_idx ON reports(forum_id);
CREATE INDEX IF NOT EXISTS reports_type_idx ON reports(report_type);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);

-- Content moderation reports
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed');
CREATE TYPE content_report_reason AS ENUM ('off_topic','harassment','misinformation','spam','hate_speech','other');

CREATE TABLE IF NOT EXISTS content_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  target_type vote_target_type NOT NULL,
  target_id   UUID NOT NULL,
  reason      content_report_reason NOT NULL,
  note        TEXT,
  status      report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_reports_target_idx ON content_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON content_reports(status);

-- Off-topic marks (AI moderation)
CREATE TABLE IF NOT EXISTS offtopic_marks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type vote_target_type NOT NULL,
  target_id   UUID NOT NULL UNIQUE,
  ai_reason   TEXT,
  confidence  NUMERIC CHECK (confidence BETWEEN 0 AND 1),
  appeal_status appeal_status NOT NULL DEFAULT 'none',
  appealed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS offtopic_marks_target_idx ON offtopic_marks(target_type, target_id);

-- Notifications
CREATE TYPE notification_type AS ENUM (
  'reply_to_thread',
  'reply_to_comment',
  'content_offtopic',
  'thread_entered_deliberation',
  'radar_primary',
  'radar_secondary',
  'report_generated',
  'periodic_report',
  'statement_approved'
);

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
