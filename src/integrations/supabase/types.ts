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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      celebrities: {
        Row: {
          bio: string
          created_at: string
          featured_order: number | null
          id: string
          is_featured: boolean
          name: string
          photo_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bio: string
          created_at?: string
          featured_order?: number | null
          id?: string
          is_featured?: boolean
          name: string
          photo_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string
          created_at?: string
          featured_order?: number | null
          id?: string
          is_featured?: boolean
          name?: string
          photo_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      event_celebrities: {
        Row: {
          bio: string
          created_at: string
          display_order: number | null
          event_id: string
          id: string
          name: string
          photo_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bio: string
          created_at?: string
          display_order?: number | null
          event_id: string
          id?: string
          name: string
          photo_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string
          created_at?: string
          display_order?: number | null
          event_id?: string
          id?: string
          name?: string
          photo_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      event_celebrity_links: {
        Row: {
          celebrity_id: string
          created_at: string
          display_order: number | null
          event_id: string
          id: string
        }
        Insert: {
          celebrity_id: string
          created_at?: string
          display_order?: number | null
          event_id: string
          id?: string
        }
        Update: {
          celebrity_id?: string
          created_at?: string
          display_order?: number | null
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_celebrity_links_celebrity_id_fkey"
            columns: ["celebrity_id"]
            isOneToOne: false
            referencedRelation: "celebrities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sponsors: {
        Row: {
          bio: string
          created_at: string
          display_order: number | null
          event_id: string
          id: string
          name: string
          photo_url: string | null
          updated_at: string
          website: string
        }
        Insert: {
          bio: string
          created_at?: string
          display_order?: number | null
          event_id: string
          id?: string
          name: string
          photo_url?: string | null
          updated_at?: string
          website: string
        }
        Update: {
          bio?: string
          created_at?: string
          display_order?: number | null
          event_id?: string
          id?: string
          name?: string
          photo_url?: string | null
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          address: string
          created_at: string | null
          date: string
          day_of_week: string
          description: string | null
          early_bird_time: string | null
          event_id: string
          ga_features: string[]
          ga_price: number
          id: string
          month: string
          poster: string | null
          time: string
          updated_at: string | null
          venue: string
          vip_features: string[]
          vip_price: number
          year: string
        }
        Insert: {
          address: string
          created_at?: string | null
          date: string
          day_of_week: string
          description?: string | null
          early_bird_time?: string | null
          event_id: string
          ga_features?: string[]
          ga_price?: number
          id?: string
          month: string
          poster?: string | null
          time: string
          updated_at?: string | null
          venue: string
          vip_features?: string[]
          vip_price?: number
          year: string
        }
        Update: {
          address?: string
          created_at?: string | null
          date?: string
          day_of_week?: string
          description?: string | null
          early_bird_time?: string | null
          event_id?: string
          ga_features?: string[]
          ga_price?: number
          id?: string
          month?: string
          poster?: string | null
          time?: string
          updated_at?: string | null
          venue?: string
          vip_features?: string[]
          vip_price?: number
          year?: string
        }
        Relationships: []
      }
      featured_celebrities: {
        Row: {
          bio: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          name: string
          photo_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bio: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          name: string
          photo_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          name?: string
          photo_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          source: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          source?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          source?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      ticket_orders: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          checked_in_by: string | null
          completed_at: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          event_date: string
          event_id: string
          event_name: string
          id: string
          qr_code: string | null
          quantity: number
          status: string | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          subscribe_to_updates: boolean | null
          ticket_type: string
          total_amount: number
          unit_price: number
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          event_date: string
          event_id: string
          event_name: string
          id?: string
          qr_code?: string | null
          quantity: number
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          subscribe_to_updates?: boolean | null
          ticket_type: string
          total_amount: number
          unit_price: number
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          event_date?: string
          event_id?: string
          event_name?: string
          id?: string
          qr_code?: string | null
          quantity?: number
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          subscribe_to_updates?: boolean | null
          ticket_type?: string
          total_amount?: number
          unit_price?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_applications: {
        Row: {
          amount_paid: number
          created_at: string
          email: string
          event_date: string
          event_id: string
          has_paid: boolean
          id: string
          instagram_handle: string | null
          merchandise_description: string
          name: string
          payment_notes: string | null
          phone: string
          price_per_table: number
          special_requests: string | null
          status: string
          synced_to_sheets_at: string | null
          table_quantity: number
          table_tier: string
          table_tier_label: string
          total_price: number
          updated_at: string
          vendor_count: number
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          email: string
          event_date: string
          event_id: string
          has_paid?: boolean
          id?: string
          instagram_handle?: string | null
          merchandise_description: string
          name: string
          payment_notes?: string | null
          phone: string
          price_per_table: number
          special_requests?: string | null
          status?: string
          synced_to_sheets_at?: string | null
          table_quantity?: number
          table_tier: string
          table_tier_label: string
          total_price: number
          updated_at?: string
          vendor_count?: number
        }
        Update: {
          amount_paid?: number
          created_at?: string
          email?: string
          event_date?: string
          event_id?: string
          has_paid?: boolean
          id?: string
          instagram_handle?: string | null
          merchandise_description?: string
          name?: string
          payment_notes?: string | null
          phone?: string
          price_per_table?: number
          special_requests?: string | null
          status?: string
          synced_to_sheets_at?: string | null
          table_quantity?: number
          table_tier?: string
          table_tier_label?: string
          total_price?: number
          updated_at?: string
          vendor_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
