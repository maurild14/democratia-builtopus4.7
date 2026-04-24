// Auto-generated from Supabase schema. Run `pnpm db:generate` to refresh.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type GeoLevel = 'neighborhood' | 'city' | 'province' | 'country';
export type UserRole = 'citizen' | 'moderator' | 'admin';
export type VoteValue = 'agree' | 'disagree' | 'pass';
export type VoteTargetType = 'thread' | 'comment' | 'statement';
export type ModerationStatus = 'visible' | 'offtopic' | 'removed';
export type DeliberationStage = 'layer1' | 'layer2' | 'layer3' | 'layer4' | 'layer5';
export type StatementSource = 'ai_extracted' | 'user_proposed';
export type StatementStatus = 'active' | 'pending' | 'rejected';
export type AppealStatus = 'none' | 'pending' | 'upheld' | 'dismissed';
export type RadarItemType = 'law' | 'decree' | 'budget' | 'report' | 'resolution' | 'other';
export type ReportType = 'deliberative' | 'periodic';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';
export type ContentReportReason = 'off_topic' | 'harassment' | 'misinformation' | 'spam' | 'hate_speech' | 'other';
export type NotificationType =
  | 'reply_to_thread'
  | 'reply_to_comment'
  | 'content_offtopic'
  | 'thread_entered_deliberation'
  | 'radar_primary'
  | 'radar_secondary'
  | 'report_generated'
  | 'periodic_report'
  | 'statement_approved';

export interface Database {
  public: {
    Tables: {
      geo_zones: {
        Row: {
          id: string;
          name: string;
          slug: string;
          level: GeoLevel;
          parent_id: string | null;
          boundary: unknown | null;
          centroid: unknown | null;
          country_code: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['geo_zones']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['geo_zones']['Insert']>;
        Relationships: [];
      };
      forums: {
        Row: {
          id: string;
          geo_zone_id: string;
          member_count: number;
          thread_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['forums']['Row'], 'id' | 'created_at' | 'member_count' | 'thread_count'>;
        Update: Partial<Database['public']['Tables']['forums']['Insert']>;
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          pseudonym: string;
          primary_zone_id: string | null;
          role: UserRole;
          locale: string;
          theme: string;
          avatar_url: string | null;
          pseudonym_changed_at: string | null;
          zone_changed_at: string | null;
          is_phone_verified: boolean;
          is_email_verified: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
        Relationships: [];
      };
      user_secondary_zones: {
        Row: {
          id: string;
          user_id: string;
          zone_id: string;
          slot: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_secondary_zones']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_secondary_zones']['Insert']>;
        Relationships: [];
      };
      user_notification_prefs: {
        Row: {
          id: string;
          user_id: string;
          notify_replies: boolean;
          notify_radar: boolean;
          notify_deliberation: boolean;
          notify_reports: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_notification_prefs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_notification_prefs']['Insert']>;
        Relationships: [];
      };
      geo_zone_ancestors: {
        Row: {
          zone_id: string;
          ancestor_id: string;
          depth: number;
        };
        Insert: Database['public']['Tables']['geo_zone_ancestors']['Row'];
        Update: Partial<Database['public']['Tables']['geo_zone_ancestors']['Row']>;
        Relationships: [];
      };
      threads: {
        Row: {
          id: string;
          forum_id: string;
          author_id: string;
          title: string;
          body: string;
          image_urls: string[];
          link_preview_url: string | null;
          link_preview_title: string | null;
          link_preview_image: string | null;
          vote_agree: number;
          vote_disagree: number;
          vote_pass: number;
          comment_count: number;
          hot_score: number;
          is_deliberation: boolean;
          deliberation_stage: DeliberationStage | null;
          deliberation_started_at: string | null;
          radar_item_id: string | null;
          moderation_status: ModerationStatus;
          edited_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['threads']['Row'], 'id' | 'created_at' | 'vote_agree' | 'vote_disagree' | 'vote_pass' | 'comment_count' | 'hot_score' | 'is_deliberation'> & {
          is_deliberation?: boolean;
        };
        Update: Partial<Database['public']['Tables']['threads']['Insert']>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          thread_id: string;
          author_id: string | null;
          parent_id: string | null;
          depth: number;
          reply_to_pseudonym: string | null;
          body: string;
          vote_agree: number;
          vote_disagree: number;
          vote_pass: number;
          moderation_status: ModerationStatus;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at' | 'vote_agree' | 'vote_disagree' | 'vote_pass'>;
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          target_type: VoteTargetType;
          target_id: string;
          value: VoteValue;
          weight: number;
          zone_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['votes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['votes']['Insert']>;
        Relationships: [];
      };
      statements: {
        Row: {
          id: string;
          thread_id: string;
          text: string;
          source: StatementSource;
          proposed_by: string | null;
          status: StatementStatus;
          endorsement_count: number;
          vote_agree: number;
          vote_disagree: number;
          vote_pass: number;
          cluster_id: number | null;
          is_consensus: boolean;
          is_divisive: boolean;
          consensus_score: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['statements']['Row'], 'id' | 'created_at' | 'endorsement_count' | 'vote_agree' | 'vote_disagree' | 'vote_pass' | 'is_consensus' | 'is_divisive'>;
        Update: Partial<Database['public']['Tables']['statements']['Insert']>;
        Relationships: [];
      };
      deliberation_results: {
        Row: {
          id: string;
          thread_id: string;
          stage: DeliberationStage;
          cluster_count: number | null;
          consensus_statement_ids: string[];
          divisive_statement_ids: string[];
          synthesis_text: string | null;
          dissenting_voices: string | null;
          proposals: Json | null;
          report_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['deliberation_results']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['deliberation_results']['Insert']>;
        Relationships: [];
      };
      radar_items: {
        Row: {
          id: string;
          forum_id: string;
          item_type: RadarItemType;
          title: string;
          source_url: string | null;
          source_name: string | null;
          original_text: string | null;
          ai_summary: string | null;
          published_at: string | null;
          is_debate_open: boolean;
          linked_thread_id: string | null;
          summary_error_reports: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['radar_items']['Row'], 'id' | 'created_at' | 'summary_error_reports' | 'is_debate_open'>;
        Update: Partial<Database['public']['Tables']['radar_items']['Insert']>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          forum_id: string;
          type: ReportType;
          title: string;
          summary: string | null;
          body: Json;
          period_start: string | null;
          period_end: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'is_published'>;
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
        Relationships: [];
      };
      content_reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: ContentReportReason;
          details: string | null;
          status: ReportStatus;
          appeal_status: AppealStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['content_reports']['Row'], 'id' | 'created_at' | 'status' | 'appeal_status'>;
        Update: Partial<Database['public']['Tables']['content_reports']['Insert']>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'is_read'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      user_forum_access: {
        Args: { p_user_id: string; p_forum_id: string };
        Returns: { has_access: boolean; is_resident: boolean; weight: number }[];
      };
      upsert_vote: {
        Args: { p_user_id: string; p_target_type: VoteTargetType; p_target_id: string; p_value: VoteValue; p_weight: number };
        Returns: { agree: number; disagree: number; pass: number }[];
      };
      calculate_hot_score: {
        Args: { p_agree: number; p_disagree: number; p_pass: number; p_comment_count: number; p_created_at: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
