import type { Tables } from "@/types/supabase";
import type { LeadIndustry } from "@/lib/industries";

export type LeadStatus = "new" | "generated" | "emailed" | "called" | "closed";

type LeadRow = Tables<{ schema: "closehound" }, "leads">;

export type Lead = Omit<LeadRow, "status"> & {
  id: LeadRow["id"];
  company_name: LeadRow["company_name"];
  contact_email: LeadRow["contact_email"];
  phone: LeadRow["phone"];
  city: LeadRow["city"];
  industry: LeadIndustry | null;
  rating: LeadRow["rating"];
  has_website: LeadRow["has_website"];
  status: LeadStatus;
  preview_url: LeadRow["preview_url"];
  created_at: LeadRow["created_at"];
};
