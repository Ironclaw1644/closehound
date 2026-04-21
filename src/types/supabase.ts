export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ClosehoundLeadIndustry =
  | "handyman"
  | "pressure washing"
  | "roofing"
  | "HVAC"
  | "plumbing"
  | "dental"
  | "med spa"
  | "junk removal"
  | "mobile detailing"

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  closehound: {
    Tables: {
      job_runs: {
        Row: {
          completed_at: string | null
          id: string
          job_id: string
          log: Json
          run_status: string | null
          started_at: string
          worker_name: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          job_id: string
          log?: Json
          run_status?: string | null
          started_at?: string
          worker_name?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          job_id?: string
          log?: Json
          run_status?: string | null
          started_at?: string
          worker_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_runs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          lead_id: string | null
          payload: Json
          requested_by: string | null
          result: Json | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type: string
          lead_id?: string | null
          payload?: Json
          requested_by?: string | null
          result?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          lead_id?: string | null
          payload?: Json
          requested_by?: string | null
          result?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          city: string | null
          company_name: string
          contact_email: string | null
          created_at: string
          has_website: boolean
          id: string
          industry: ClosehoundLeadIndustry | null
          phone: string | null
          preview_url: string | null
          rating: number | null
          status: string
        }
        Insert: {
          city?: string | null
          company_name: string
          contact_email?: string | null
          created_at?: string
          has_website?: boolean
          id?: string
          industry?: ClosehoundLeadIndustry | null
          phone?: string | null
          preview_url?: string | null
          rating?: number | null
          status?: string
        }
        Update: {
          city?: string | null
          company_name?: string
          contact_email?: string | null
          created_at?: string
          has_website?: boolean
          id?: string
          industry?: ClosehoundLeadIndustry | null
          phone?: string | null
          preview_url?: string | null
          rating?: number | null
          status?: string
        }
        Relationships: []
      }
      operator_locks: {
        Row: {
          expires_at: string | null
          lock_key: string
          locked_at: string
          locked_by: string | null
        }
        Insert: {
          expires_at?: string | null
          lock_key: string
          locked_at?: string
          locked_by?: string | null
        }
        Update: {
          expires_at?: string | null
          lock_key?: string
          locked_at?: string
          locked_by?: string | null
        }
        Relationships: []
      }
      preview_sites: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          preview_payload: Json
          preview_url: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          preview_payload: Json
          preview_url: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          preview_payload?: Json
          preview_url?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preview_sites_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      template_image_candidates: {
        Row: {
          approval_updated_at: string | null
          approval_updated_by: string | null
          aspect_ratio: string
          asset_url: string | null
          candidate_index: number
          created_at: string
          created_by: string
          crop_notes: string | null
          family_key: string
          generation_batch_id: string
          id: string
          lead_id: string | null
          model: string
          negative_prompt: string
          prompt: string
          prompt_version: string
          provider: string
          seed_business_key: string | null
          slot: string
          status: string
          storage_path: string
          template_key: string
          template_version: string
        }
        Insert: {
          approval_updated_at?: string | null
          approval_updated_by?: string | null
          aspect_ratio: string
          asset_url?: string | null
          candidate_index: number
          created_at?: string
          created_by: string
          crop_notes?: string | null
          family_key: string
          generation_batch_id: string
          id: string
          lead_id?: string | null
          model: string
          negative_prompt: string
          prompt: string
          prompt_version: string
          provider: string
          seed_business_key?: string | null
          slot: string
          status: string
          storage_path: string
          template_key: string
          template_version: string
        }
        Update: {
          approval_updated_at?: string | null
          approval_updated_by?: string | null
          aspect_ratio?: string
          asset_url?: string | null
          candidate_index?: number
          created_at?: string
          created_by?: string
          crop_notes?: string | null
          family_key?: string
          generation_batch_id?: string
          id?: string
          lead_id?: string | null
          model?: string
          negative_prompt?: string
          prompt?: string
          prompt_version?: string
          provider?: string
          seed_business_key?: string | null
          slot?: string
          status?: string
          storage_path?: string
          template_key?: string
          template_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_image_candidates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      client_prompt_packs: {
        Row: {
          client_name: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          pack_name: string
          prompts: Json
          updated_at: string
        }
        Insert: {
          client_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          pack_name: string
          prompts?: Json
          updated_at?: string
        }
        Update: {
          client_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          pack_name?: string
          prompts?: Json
          updated_at?: string
        }
        Relationships: []
      }
      prompt_favorites: {
        Row: {
          created_at: string
          created_by: string | null
          form_data: Json
          generated_json: Json
          generated_prompt: string
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          form_data?: Json
          generated_json?: Json
          generated_prompt: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          form_data?: Json
          generated_json?: Json
          generated_prompt?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompt_presets: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          form_data: Json
          id: string
          is_system: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          form_data?: Json
          id?: string
          is_system?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          form_data?: Json
          id?: string
          is_system?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  closehound: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
