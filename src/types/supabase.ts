// Hand-maintained typing for the `closehound` schema (Section 8 deal-screener).
// Mirrors supabase/migrations/20260608000000_closehound_section8_schema.sql.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamp = string;

export type Database = {
  closehound: {
    Tables: {
      safmr_cache: {
        Row: {
          zip: string;
          fiscal_year: number;
          br0: number | null;
          br1: number | null;
          br2: number | null;
          br3: number | null;
          br4: number | null;
          metro_code: string | null;
          metro_name: string | null;
          is_safmr: boolean;
          fetched_at: Timestamp;
        };
        Insert: {
          zip: string;
          fiscal_year: number;
          br0?: number | null;
          br1?: number | null;
          br2?: number | null;
          br3?: number | null;
          br4?: number | null;
          metro_code?: string | null;
          metro_name?: string | null;
          is_safmr?: boolean;
          fetched_at?: Timestamp;
        };
        Update: Partial<Database["closehound"]["Tables"]["safmr_cache"]["Insert"]>;
        Relationships: [];
      };
      market_cache: {
        Row: {
          zip: string;
          bedrooms: number;
          median_sale_price: number | null;
          median_rent: number | null;
          fetched_at: Timestamp;
        };
        Insert: {
          zip: string;
          bedrooms: number;
          median_sale_price?: number | null;
          median_rent?: number | null;
          fetched_at?: Timestamp;
        };
        Update: Partial<Database["closehound"]["Tables"]["market_cache"]["Insert"]>;
        Relationships: [];
      };
      listings_cache: {
        Row: {
          rentcast_id: string;
          zip: string;
          address: string | null;
          price: number | null;
          beds: number | null;
          baths: number | null;
          sqft: number | null;
          year_built: number | null;
          annual_tax: number | null;
          raw: Json | null;
          fetched_at: Timestamp;
        };
        Insert: {
          rentcast_id: string;
          zip: string;
          address?: string | null;
          price?: number | null;
          beds?: number | null;
          baths?: number | null;
          sqft?: number | null;
          year_built?: number | null;
          annual_tax?: number | null;
          raw?: Json | null;
          fetched_at?: Timestamp;
        };
        Update: Partial<Database["closehound"]["Tables"]["listings_cache"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          plan: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          user_id: string;
          plan?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["closehound"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      usage: {
        Row: {
          user_id: string;
          period_month: string;
          screens_used: number;
        };
        Insert: {
          user_id: string;
          period_month: string;
          screens_used?: number;
        };
        Update: Partial<Database["closehound"]["Tables"]["usage"]["Insert"]>;
        Relationships: [];
      };
      screening_runs: {
        Row: {
          id: string;
          user_id: string;
          markets: Json;
          assumptions: Json;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          markets: Json;
          assumptions: Json;
          created_at?: Timestamp;
        };
        Update: Partial<Database["closehound"]["Tables"]["screening_runs"]["Insert"]>;
        Relationships: [];
      };
      saved_deals: {
        Row: {
          id: string;
          user_id: string;
          listing: Json;
          underwriting: Json;
          notes: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing: Json;
          underwriting: Json;
          notes?: string | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["closehound"]["Tables"]["saved_deals"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
