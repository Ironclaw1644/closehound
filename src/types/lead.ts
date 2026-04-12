export type LeadStatus = "new" | "generated" | "emailed" | "called" | "closed";

export type Lead = {
  id: string;
  company_name: string;
  phone: string;
  city: string;
  industry: string;
  rating: number | null;
  has_website: boolean;
  status: LeadStatus;
  preview_url: string | null;
  created_at: string;
};
