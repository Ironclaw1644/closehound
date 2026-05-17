import type { LeadIndustry } from "@/lib/industries";
import type { Tables } from "@/types/supabase";

export type LeadStatus = "new" | "generated" | "emailed" | "called" | "closed";

type LeadRow = Tables<{ schema: "closehound" }, "leads">;

export type Lead = Omit<LeadRow, "industry" | "status"> & {
  industry: LeadIndustry | null;
  status: LeadStatus;
};

export const LEAD_STATUS_ORDER: readonly LeadStatus[] = [
  "new",
  "generated",
  "emailed",
  "called",
  "closed",
] as const;
