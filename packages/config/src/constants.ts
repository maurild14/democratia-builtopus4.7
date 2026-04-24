// Geographic weights per zone relationship
export const GEO_WEIGHT_PRIMARY = 1.0;
export const GEO_WEIGHT_SECONDARY_1 = 0.75;
export const GEO_WEIGHT_SECONDARY_2 = 0.50;
export const MAX_SECONDARY_ZONES = 2;

// Cooldown periods (days)
export const PSEUDONYM_CHANGE_COOLDOWN_DAYS = 15;
export const PRIMARY_ZONE_CHANGE_COOLDOWN_DAYS = 180;

// Comment nesting
export const MAX_COMMENT_DEPTH = 5;

// Thread edit window (minutes)
export const THREAD_EDIT_WINDOW_MINUTES = 5;

// Deliberation elevation thresholds (relative to forum size)
export const ELEVATION_MIN_VOTES = 50;
export const ELEVATION_MIN_UNIQUE_USERS = 10;
export const ELEVATION_ENGAGEMENT_RATIO = 0.05;

// Statement voting
export const STATEMENT_ENDORSEMENT_THRESHOLD = 10;
export const MIN_VOTES_FOR_CLUSTERING = 20;

// Clustering
export const CLUSTER_K_MIN = 2;
export const CLUSTER_K_MAX = 8;
export const SILHOUETTE_THRESHOLD = 0.3;
export const CONSENSUS_AGREEMENT_THRESHOLD = 0.7;
export const DIVISIVE_SPREAD_THRESHOLD = 0.4;

// Hot score gravity
export const HOT_SCORE_GRAVITY = 1.8;

// Radar
export const RADAR_INGEST_INTERVAL_HOURS = 6;
export const RADAR_SUMMARY_ERROR_THRESHOLD = 5;

// k-anonymity
export const K_ANONYMITY_MIN = 20;

// Notification badge max
export const NOTIFICATION_BADGE_MAX = 99;

// Pilot cities
export const PILOT_CITIES = ['CABA', 'San Francisco'] as const;
export type PilotCity = (typeof PILOT_CITIES)[number];

// LLM
export const LLM_MODEL = 'claude-sonnet-4-20250514' as const;
export const LLM_MAX_TOKENS = 4096;
export const LLM_TEMPERATURE = 0;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Forum levels
export const GEO_LEVELS = ['neighborhood', 'city', 'province', 'country'] as const;
export type GeoLevel = (typeof GEO_LEVELS)[number];

// Vote types
export const VOTE_VALUES = ['agree', 'disagree', 'pass'] as const;
export type VoteValue = (typeof VOTE_VALUES)[number];

// Vote target types
export const VOTE_TARGET_TYPES = ['thread', 'comment', 'statement'] as const;
export type VoteTargetType = (typeof VOTE_TARGET_TYPES)[number];

// User roles
export const USER_ROLES = ['citizen', 'moderator', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Deliberation stages
export const DELIBERATION_STAGES = ['layer1', 'layer2', 'layer3', 'layer4', 'layer5'] as const;
export type DeliberationStage = (typeof DELIBERATION_STAGES)[number];

// Report types
export const REPORT_TYPES = ['deliberative', 'periodic'] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

// Content report reasons
export const CONTENT_REPORT_REASONS = [
  'off_topic',
  'harassment',
  'misinformation',
  'spam',
  'hate_speech',
  'other',
] as const;
export type ContentReportReason = (typeof CONTENT_REPORT_REASONS)[number];

// Radar item types
export const RADAR_ITEM_TYPES = ['law', 'decree', 'budget', 'report', 'resolution', 'other'] as const;
export type RadarItemType = (typeof RADAR_ITEM_TYPES)[number];
