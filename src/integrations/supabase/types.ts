export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          auto_generate_enabled: boolean
          id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auto_generate_enabled?: boolean
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auto_generate_enabled?: boolean
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      article_generation_runs: {
        Row: {
          articles_created: number
          error_summary: string | null
          errors_count: number
          finished_at: string | null
          id: string
          sources_found: number
          started_at: string
          status: string
          trigger: string
        }
        Insert: {
          articles_created?: number
          error_summary?: string | null
          errors_count?: number
          finished_at?: string | null
          id?: string
          sources_found?: number
          started_at?: string
          status?: string
          trigger?: string
        }
        Update: {
          articles_created?: number
          error_summary?: string | null
          errors_count?: number
          finished_at?: string | null
          id?: string
          sources_found?: number
          started_at?: string
          status?: string
          trigger?: string
        }
        Relationships: []
      }
      article_report_messages: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string
          direction: string
          from_email: string
          id: string
          meta: Json
          provider_message_id: string | null
          report_id: string | null
          subject: string | null
          thread_token: string
          to_email: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          direction: string
          from_email: string
          id?: string
          meta?: Json
          provider_message_id?: string | null
          report_id?: string | null
          subject?: string | null
          thread_token: string
          to_email: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          direction?: string
          from_email?: string
          id?: string
          meta?: Json
          provider_message_id?: string | null
          report_id?: string | null
          subject?: string | null
          thread_token?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_report_messages_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "article_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      article_reports: {
        Row: {
          article_slug: string
          article_title: string | null
          consent_at: string
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          ip_hash: string | null
          reason: string | null
          reporter_email: string
          reporter_name: string
          status: string
          thread_token: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          article_slug: string
          article_title?: string | null
          consent_at?: string
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: string
          ip_hash?: string | null
          reason?: string | null
          reporter_email: string
          reporter_name: string
          status?: string
          thread_token?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          article_slug?: string
          article_title?: string | null
          consent_at?: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          ip_hash?: string | null
          reason?: string | null
          reporter_email?: string
          reporter_name?: string
          status?: string
          thread_token?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      article_sources: {
        Row: {
          article_id: string | null
          category: string
          content_hash: string | null
          created_at: string
          discovered_at: string
          id: string
          related_sources: Json | null
          scraped_text: string | null
          skip_reason: string | null
          source_domain: string | null
          source_title: string | null
          source_url: string
          status: string
        }
        Insert: {
          article_id?: string | null
          category: string
          content_hash?: string | null
          created_at?: string
          discovered_at?: string
          id?: string
          related_sources?: Json | null
          scraped_text?: string | null
          skip_reason?: string | null
          source_domain?: string | null
          source_title?: string | null
          source_url: string
          status?: string
        }
        Update: {
          article_id?: string | null
          category?: string
          content_hash?: string | null
          created_at?: string
          discovered_at?: string
          id?: string
          related_sources?: Json | null
          scraped_text?: string | null
          skip_reason?: string | null
          source_domain?: string | null
          source_title?: string | null
          source_url?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_sources_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          body: string
          category: Database["public"]["Enums"]["article_category"]
          cover_image: string | null
          cover_image_caption: string | null
          cover_image_credit: string | null
          cover_image_is_ai: boolean
          created_at: string
          excerpt: string | null
          id: string
          og_image: string | null
          published_at: string | null
          read_time: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          source: string | null
          status: Database["public"]["Enums"]["article_status"]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          body?: string
          category: Database["public"]["Enums"]["article_category"]
          cover_image?: string | null
          cover_image_caption?: string | null
          cover_image_credit?: string | null
          cover_image_is_ai?: boolean
          created_at?: string
          excerpt?: string | null
          id?: string
          og_image?: string | null
          published_at?: string | null
          read_time?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          source?: string | null
          status?: Database["public"]["Enums"]["article_status"]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          body?: string
          category?: Database["public"]["Enums"]["article_category"]
          cover_image?: string | null
          cover_image_caption?: string | null
          cover_image_credit?: string | null
          cover_image_is_ai?: boolean
          created_at?: string
          excerpt?: string | null
          id?: string
          og_image?: string | null
          published_at?: string | null
          read_time?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          source?: string | null
          status?: Database["public"]["Enums"]["article_status"]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      bike_reviews: {
        Row: {
          bike_id: string
          body: string
          created_at: string
          id: string
          photos: Json
          rating: number
          status: string
          title: string
          updated_at: string
          user_id: string
          verified_owner: boolean
        }
        Insert: {
          bike_id: string
          body: string
          created_at?: string
          id?: string
          photos?: Json
          rating: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
          verified_owner?: boolean
        }
        Update: {
          bike_id?: string
          body?: string
          created_at?: string
          id?: string
          photos?: Json
          rating?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          verified_owner?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bike_reviews_bike_id_fkey"
            columns: ["bike_id"]
            isOneToOne: false
            referencedRelation: "bikes"
            referencedColumns: ["id"]
          },
        ]
      }
      bikes: {
        Row: {
          accessories: Json
          ai_summary: Json
          availability: string | null
          awards: Json
          bike_type: string | null
          brakes_detail: Json
          brand: string
          category: string
          cockpit: Json
          costs: Json
          created_at: string
          description: string | null
          drivetrain_detail: Json
          ebike: Json | null
          ebike_detail: Json
          environmental: Json
          excerpt: string | null
          expert_rating: number | null
          faq: Json
          featured: boolean
          gallery: Json
          geometry: Json
          highlights: Json
          id: string
          image_url: string | null
          intended_use: string[]
          keywords: string[]
          maintenance: Json
          manufacturer_url: string | null
          meta_description: string | null
          meta_title: string | null
          model: string
          model_history: Json
          og_image_url: string | null
          performance: Json
          price_date: string | null
          price_eur: number | null
          published: boolean
          published_at: string | null
          range_matrix: Json
          ratings: Json
          safety_features: Json
          slug: string
          specs: Json
          suitability: Json
          terrain: string[]
          updated_at: string
          videos: Json
          wheelset: Json
          year: number | null
        }
        Insert: {
          accessories?: Json
          ai_summary?: Json
          availability?: string | null
          awards?: Json
          bike_type?: string | null
          brakes_detail?: Json
          brand: string
          category: string
          cockpit?: Json
          costs?: Json
          created_at?: string
          description?: string | null
          drivetrain_detail?: Json
          ebike?: Json | null
          ebike_detail?: Json
          environmental?: Json
          excerpt?: string | null
          expert_rating?: number | null
          faq?: Json
          featured?: boolean
          gallery?: Json
          geometry?: Json
          highlights?: Json
          id?: string
          image_url?: string | null
          intended_use?: string[]
          keywords?: string[]
          maintenance?: Json
          manufacturer_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          model: string
          model_history?: Json
          og_image_url?: string | null
          performance?: Json
          price_date?: string | null
          price_eur?: number | null
          published?: boolean
          published_at?: string | null
          range_matrix?: Json
          ratings?: Json
          safety_features?: Json
          slug: string
          specs?: Json
          suitability?: Json
          terrain?: string[]
          updated_at?: string
          videos?: Json
          wheelset?: Json
          year?: number | null
        }
        Update: {
          accessories?: Json
          ai_summary?: Json
          availability?: string | null
          awards?: Json
          bike_type?: string | null
          brakes_detail?: Json
          brand?: string
          category?: string
          cockpit?: Json
          costs?: Json
          created_at?: string
          description?: string | null
          drivetrain_detail?: Json
          ebike?: Json | null
          ebike_detail?: Json
          environmental?: Json
          excerpt?: string | null
          expert_rating?: number | null
          faq?: Json
          featured?: boolean
          gallery?: Json
          geometry?: Json
          highlights?: Json
          id?: string
          image_url?: string | null
          intended_use?: string[]
          keywords?: string[]
          maintenance?: Json
          manufacturer_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          model?: string
          model_history?: Json
          og_image_url?: string | null
          performance?: Json
          price_date?: string | null
          price_eur?: number | null
          published?: boolean
          published_at?: string | null
          range_matrix?: Json
          ratings?: Json
          safety_features?: Json
          slug?: string
          specs?: Json
          suitability?: Json
          terrain?: string[]
          updated_at?: string
          videos?: Json
          wheelset?: Json
          year?: number | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          message: string
          name: string
          status: Database["public"]["Enums"]["contact_status"]
          subject: string
          topic: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          message: string
          name: string
          status?: Database["public"]["Enums"]["contact_status"]
          subject: string
          topic: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          message?: string
          name?: string
          status?: Database["public"]["Enums"]["contact_status"]
          subject?: string
          topic?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      lexikon_terms: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          related_article_slugs: string[]
          related_term_slugs: string[]
          seo_description: string | null
          seo_title: string | null
          short_definition: string
          slug: string
          status: string
          synonyms: string[]
          term: string
          updated_at: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          id?: string
          related_article_slugs?: string[]
          related_term_slugs?: string[]
          seo_description?: string | null
          seo_title?: string | null
          short_definition: string
          slug: string
          status?: string
          synonyms?: string[]
          term: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          related_article_slugs?: string[]
          related_term_slugs?: string[]
          seo_description?: string | null
          seo_title?: string | null
          short_definition?: string
          slug?: string
          status?: string
          synonyms?: string[]
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_deliveries: {
        Row: {
          attempts: number
          created_at: string
          email: string
          error: string | null
          id: string
          issue_id: string
          message_id: string | null
          sent_at: string | null
          status: string
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          email: string
          error?: string | null
          id?: string
          issue_id: string
          message_id?: string | null
          sent_at?: string | null
          status?: string
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          email?: string
          error?: string | null
          id?: string
          issue_id?: string
          message_id?: string | null
          sent_at?: string | null
          status?: string
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_deliveries_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "newsletter_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_deliveries_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_issues: {
        Row: {
          article_ids: string[]
          created_at: string
          error: string | null
          html: string
          id: string
          issue_date: string
          preheader: string | null
          recipients_failed: number
          recipients_sent: number
          recipients_total: number
          sent_at: string | null
          status: string
          subject: string
          text: string
          updated_at: string
        }
        Insert: {
          article_ids?: string[]
          created_at?: string
          error?: string | null
          html: string
          id?: string
          issue_date: string
          preheader?: string | null
          recipients_failed?: number
          recipients_sent?: number
          recipients_total?: number
          sent_at?: string | null
          status?: string
          subject: string
          text: string
          updated_at?: string
        }
        Update: {
          article_ids?: string[]
          created_at?: string
          error?: string | null
          html?: string
          id?: string
          issue_date?: string
          preheader?: string | null
          recipients_failed?: number
          recipients_sent?: number
          recipients_total?: number
          sent_at?: string | null
          status?: string
          subject?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirm_token: string
          confirmed_at: string | null
          consent_text: string | null
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          source: string
          status: string
          subscribed_at: string
          unsubscribe_token: string
          unsubscribed_at: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          confirm_token?: string
          confirmed_at?: string | null
          consent_text?: string | null
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          source?: string
          status?: string
          subscribed_at?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          confirm_token?: string
          confirmed_at?: string | null
          consent_text?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          source?: string
          status?: string
          subscribed_at?: string
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      exec_read_sql: { Args: { _sql: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      article_category: "Nachrichten" | "Ratgeber" | "E-Bikes" | "Tests"
      article_status: "draft" | "published"
      contact_status: "new" | "read" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
      article_category: ["Nachrichten", "Ratgeber", "E-Bikes", "Tests"],
      article_status: ["draft", "published"],
      contact_status: ["new", "read", "archived"],
    },
  },
} as const
