-- User roles
CREATE TYPE user_role AS ENUM ('citizen', 'moderator', 'admin');

-- Forums (1:1 with geo_zones)
CREATE TABLE IF NOT EXISTS forums (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geo_zone_id  UUID NOT NULL UNIQUE REFERENCES geo_zones(id) ON DELETE CASCADE,
  member_count INT NOT NULL DEFAULT 0 CHECK (member_count >= 0),
  thread_count INT NOT NULL DEFAULT 0 CHECK (thread_count >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS forums_geo_zone_idx ON forums(geo_zone_id);

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudonym             TEXT NOT NULL UNIQUE,
  primary_zone_id       UUID REFERENCES geo_zones(id) ON DELETE SET NULL,
  role                  user_role NOT NULL DEFAULT 'citizen',
  locale                TEXT NOT NULL DEFAULT 'en',
  theme                 TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  avatar_url            TEXT,
  pseudonym_changed_at  TIMESTAMPTZ,
  zone_changed_at       TIMESTAMPTZ,
  is_phone_verified     BOOLEAN NOT NULL DEFAULT false,
  is_email_verified     BOOLEAN NOT NULL DEFAULT false,
  deleted_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_pseudonym_lower ON user_profiles (LOWER(pseudonym));
CREATE INDEX IF NOT EXISTS user_profiles_primary_zone_idx ON user_profiles(primary_zone_id);
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON user_profiles(role);

-- Secondary zones (up to 2 per user)
CREATE TABLE IF NOT EXISTS user_secondary_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  geo_zone_id UUID NOT NULL REFERENCES geo_zones(id) ON DELETE CASCADE,
  slot        INT NOT NULL CHECK (slot IN (1, 2)),
  weight      NUMERIC(3,2) NOT NULL CHECK (weight IN (0.75, 0.50)),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, slot),
  UNIQUE (user_id, geo_zone_id)
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS user_notification_prefs (
  user_id                         UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  reply_to_thread                 BOOLEAN NOT NULL DEFAULT true,
  reply_to_comment                BOOLEAN NOT NULL DEFAULT true,
  content_offtopic                BOOLEAN NOT NULL DEFAULT true, -- not disableable in UI
  thread_entered_deliberation     BOOLEAN NOT NULL DEFAULT true,
  radar_primary                   BOOLEAN NOT NULL DEFAULT true,
  radar_secondary                 BOOLEAN NOT NULL DEFAULT false,
  report_generated                BOOLEAN NOT NULL DEFAULT true,
  periodic_report                 BOOLEAN NOT NULL DEFAULT true,
  statement_approved              BOOLEAN NOT NULL DEFAULT true,
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pseudonym TEXT;
  v_zone_id UUID;
BEGIN
  v_pseudonym := COALESCE(
    NEW.raw_user_meta_data->>'pseudonym',
    'user_' || LEFT(REPLACE(NEW.id::TEXT, '-', ''), 8)
  );
  v_zone_id := (NEW.raw_user_meta_data->>'primary_zone_id')::UUID;

  INSERT INTO user_profiles (id, pseudonym, primary_zone_id)
  VALUES (NEW.id, v_pseudonym, v_zone_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_notification_prefs (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Increment forum member count
  IF v_zone_id IS NOT NULL THEN
    UPDATE forums SET member_count = member_count + 1
    WHERE geo_zone_id = v_zone_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
