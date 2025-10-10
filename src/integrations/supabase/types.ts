export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      add_ons: {
        Row: {
          created_at: string
          description: string
          duration_minutes: number
          id: string
          name: string
          price_cents: number
          recommended_for: string[]
        }
        Insert: {
          created_at?: string
          description: string
          duration_minutes: number
          id: string
          name: string
          price_cents: number
          recommended_for?: string[]
        }
        Update: {
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          name?: string
          price_cents?: number
          recommended_for?: string[]
        }
        Relationships: []
      }
      booking_add_ons: {
        Row: {
          add_on_id: string
          booking_id: string
          id: number
        }
        Insert: {
          add_on_id: string
          booking_id: string
          id?: number
        }
        Update: {
          add_on_id?: string
          booking_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_add_ons_add_on_id_fkey"
            columns: ["add_on_id"]
            referencedRelation: "add_ons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_add_ons_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          appointment_date: string
          client_email: string
          client_name: string
          client_phone: string
          created_at: string
          duration_minutes: number
          id: string
          marketing_consent: boolean
          notes: string | null
          service_id: string
          start_time: string
          stylist_id: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          client_email: string
          client_name: string
          client_phone: string
          created_at?: string
          duration_minutes: number
          id?: string
          marketing_consent?: boolean
          notes?: string | null
          service_id: string
          start_time: string
          stylist_id: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          marketing_consent?: boolean
          notes?: string | null
          service_id?: string
          start_time?: string
          stylist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_stylist_id_fkey"
            columns: ["stylist_id"]
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string
          duration_minutes: number
          id: string
          includes: string[]
          name: string
          price_cents: number
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description: string
          duration_minutes: number
          id: string
          includes?: string[]
          name: string
          price_cents: number
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          includes?: string[]
          name?: string
          price_cents?: number
        }
        Relationships: []
      }
      stylist_schedule_breaks: {
        Row: {
          break_end: string
          break_start: string
          id: number
          schedule_id: number
        }
        Insert: {
          break_end: string
          break_start: string
          id?: number
          schedule_id: number
        }
        Update: {
          break_end?: string
          break_start?: string
          id?: number
          schedule_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "stylist_schedule_breaks_schedule_id_fkey"
            columns: ["schedule_id"]
            referencedRelation: "stylist_schedules"
            referencedColumns: ["id"]
          }
        ]
      }
      stylist_schedules: {
        Row: {
          block_end: string
          block_start: string
          day_of_week: number
          id: number
          stylist_id: string
        }
        Insert: {
          block_end: string
          block_start: string
          day_of_week: number
          id?: number
          stylist_id: string
        }
        Update: {
          block_end?: string
          block_start?: string
          day_of_week?: number
          id?: number
          stylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stylist_schedules_stylist_id_fkey"
            columns: ["stylist_id"]
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          }
        ]
      }
      stylist_specialties: {
        Row: {
          id: number
          service_id: string
          stylist_id: string
        }
        Insert: {
          id?: number
          service_id: string
          stylist_id: string
        }
        Update: {
          id?: number
          service_id?: string
          stylist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stylist_specialties_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stylist_specialties_stylist_id_fkey"
            columns: ["stylist_id"]
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          }
        ]
      }
      stylists: {
        Row: {
          bio: string
          created_at: string
          id: string
          name: string
          rating: number
          title: string
          years_experience: number
        }
        Insert: {
          bio: string
          created_at?: string
          id: string
          name: string
          rating: number
          title: string
          years_experience: number
        }
        Update: {
          bio?: string
          created_at?: string
          id?: string
          name?: string
          rating?: number
          title?: string
          years_experience?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_booking: {
        Args: {
          p_service_id: string
          p_stylist_id: string
          p_appointment_date: string
          p_start_time: string
          p_duration_minutes: number
          p_client_name: string
          p_client_email: string
          p_client_phone: string
          p_notes: string | null
          p_marketing_consent: boolean
          p_add_on_ids: string[] | null
        }
        Returns: Database["public"]["Tables"]["bookings"]["Row"]
      }
      [_ in never]: never
    }
    Enums: {
      service_category: "cut" | "shave" | "color" | "package"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      service_category: ["cut", "shave", "color", "package"] as const,
    },
  },
} as const
