export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
  | "landscaping"
  | "painting"
  | "electrical"
  | "auto repair"
  | "pest control";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  closehound: {
    Tables: {
      job_runs: {
        Row: {
          completed_at: string | null;
          id: string;
          job_id: string;
          log: Json;
          run_status: string | null;
          started_at: string;
          worker_name: string | null;
        };
        Insert: {
          completed_at?: string | null;
          id?: string;
          job_id: string;
          log?: Json;
          run_status?: string | null;
          started_at?: string;
          worker_name?: string | null;
        };
        Update: {
          completed_at?: string | null;
          id?: string;
          job_id?: string;
          log?: Json;
          run_status?: string | null;
          started_at?: string;
          worker_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "job_runs_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          completed_at: string | null;
          created_at: string;
          error_message: string | null;
          id: string;
          job_type: string;
          lead_id: string | null;
          payload: Json;
          requested_by: string | null;
          result: Json | null;
          started_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          job_type: string;
          lead_id?: string | null;
          payload?: Json;
          requested_by?: string | null;
          result?: Json | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          job_type?: string;
          lead_id?: string | null;
          payload?: Json;
          requested_by?: string | null;
          result?: Json | null;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          city: string | null;
          company_name: string;
          contact_email: string | null;
          created_at: string;
          has_website: boolean;
          id: string;
          industry: ClosehoundLeadIndustry | null;
          lead_score: number | null;
          lead_source: string | null;
          notes: string | null;
          phone: string | null;
          place_id: string | null;
          preview_url: string | null;
          rating: number | null;
          review_count: number | null;
          status: string;
          top_review: string | null;
          top_reviewer_name: string | null;
          years_in_business: number | null;
        };
        Insert: {
          city?: string | null;
          company_name: string;
          contact_email?: string | null;
          created_at?: string;
          has_website?: boolean;
          id?: string;
          industry?: ClosehoundLeadIndustry | null;
          lead_score?: number | null;
          lead_source?: string | null;
          notes?: string | null;
          phone?: string | null;
          place_id?: string | null;
          preview_url?: string | null;
          rating?: number | null;
          review_count?: number | null;
          status?: string;
          top_review?: string | null;
          top_reviewer_name?: string | null;
          years_in_business?: number | null;
        };
        Update: {
          city?: string | null;
          company_name?: string;
          contact_email?: string | null;
          created_at?: string;
          has_website?: boolean;
          id?: string;
          industry?: ClosehoundLeadIndustry | null;
          lead_score?: number | null;
          lead_source?: string | null;
          notes?: string | null;
          phone?: string | null;
          place_id?: string | null;
          preview_url?: string | null;
          rating?: number | null;
          review_count?: number | null;
          status?: string;
          top_review?: string | null;
          top_reviewer_name?: string | null;
          years_in_business?: number | null;
        };
        Relationships: [];
      };
      operator_locks: {
        Row: {
          expires_at: string | null;
          lock_key: string;
          locked_at: string;
          locked_by: string | null;
        };
        Insert: {
          expires_at?: string | null;
          lock_key: string;
          locked_at?: string;
          locked_by?: string | null;
        };
        Update: {
          expires_at?: string | null;
          lock_key?: string;
          locked_at?: string;
          locked_by?: string | null;
        };
        Relationships: [];
      };
      preview_sites: {
        Row: {
          created_at: string;
          generated_at: string | null;
          hero_url: string | null;
          id: string;
          lead_id: string;
          logo_url: string | null;
          preview_payload: Json;
          preview_url: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          generated_at?: string | null;
          hero_url?: string | null;
          id?: string;
          lead_id: string;
          logo_url?: string | null;
          preview_payload: Json;
          preview_url: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          generated_at?: string | null;
          hero_url?: string | null;
          id?: string;
          lead_id?: string;
          logo_url?: string | null;
          preview_payload?: Json;
          preview_url?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "preview_sites_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      purchases: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          customer_email: string | null;
          customer_name: string | null;
          domain: string | null;
          fulfilled_at: string | null;
          id: string;
          lead_id: string;
          notes: string | null;
          paid_at: string | null;
          status: string;
          stripe_customer_id: string | null;
          stripe_session_id: string | null;
          updated_at: string;
          vercel_project_id: string | null;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          currency?: string;
          customer_email?: string | null;
          customer_name?: string | null;
          domain?: string | null;
          fulfilled_at?: string | null;
          id?: string;
          lead_id: string;
          notes?: string | null;
          paid_at?: string | null;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_session_id?: string | null;
          updated_at?: string;
          vercel_project_id?: string | null;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          customer_email?: string | null;
          customer_name?: string | null;
          domain?: string | null;
          fulfilled_at?: string | null;
          id?: string;
          lead_id?: string;
          notes?: string | null;
          paid_at?: string | null;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_session_id?: string | null;
          updated_at?: string;
          vercel_project_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
  public: {
    Tables: { [_ in never]: never };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export const Constants = {
  closehound: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
