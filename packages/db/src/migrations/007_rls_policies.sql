-- Enable Row Level Security on all tables
ALTER TABLE geo_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_zone_ancestors ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_secondary_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliberation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE radar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE offtopic_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- geo_zones: public read
CREATE POLICY "geo_zones_public_read" ON geo_zones FOR SELECT USING (true);
CREATE POLICY "geo_zone_ancestors_public_read" ON geo_zone_ancestors FOR SELECT USING (true);

-- forums: public read
CREATE POLICY "forums_public_read" ON forums FOR SELECT USING (true);

-- user_profiles: public read, own update
CREATE POLICY "profiles_public_read" ON user_profiles FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "profiles_own_update" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- user_secondary_zones: own read/write
CREATE POLICY "secondary_zones_own" ON user_secondary_zones
  FOR ALL USING (auth.uid() = user_id);

-- notification_prefs: own read/write
CREATE POLICY "notification_prefs_own" ON user_notification_prefs
  FOR ALL USING (auth.uid() = user_id);

-- threads: public read, auth create
CREATE POLICY "threads_public_read" ON threads FOR SELECT USING (moderation_status != 'removed');
CREATE POLICY "threads_auth_create" ON threads FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = author_id
  );
CREATE POLICY "threads_author_update" ON threads FOR UPDATE
  USING (
    auth.uid() = author_id
    AND edited_at IS NULL
    AND created_at > now() - INTERVAL '5 minutes'
  );

-- comments: public read, auth create
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (moderation_status != 'removed');
CREATE POLICY "comments_auth_create" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- votes: own read/write
CREATE POLICY "votes_own" ON votes FOR ALL USING (auth.uid() = user_id);

-- statements: public read
CREATE POLICY "statements_public_read" ON statements FOR SELECT USING (status != 'rejected');
CREATE POLICY "statements_auth_propose" ON statements FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = proposed_by);

-- deliberation_results: public read
CREATE POLICY "deliberation_results_public_read" ON deliberation_results FOR SELECT USING (true);

-- radar_items: public read
CREATE POLICY "radar_items_public_read" ON radar_items FOR SELECT USING (true);

-- reports: public read for public reports
CREATE POLICY "reports_public_read" ON reports FOR SELECT USING (is_public = true);

-- content_reports: own write, moderator read
CREATE POLICY "content_reports_own_write" ON content_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "content_reports_mod_read" ON content_reports FOR SELECT
  USING (
    auth.uid() = reporter_id
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('moderator','admin'))
  );

-- offtopic_marks: public read
CREATE POLICY "offtopic_marks_public_read" ON offtopic_marks FOR SELECT USING (true);

-- notifications: own read/write
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id);
