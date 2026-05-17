// Reads /tmp/leadhound-pulls.json and emits a single multi-row INSERT
// to /tmp/leadhound-inserts.sql, suitable for execute_sql via the Supabase MCP.

import { promises as fs } from "node:fs";

const IN = "/tmp/leadhound-pulls.json";
const OUT_DIR = "/tmp/leadhound-sql";

function quote(value: string | null): string {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function num(value: number | null): string {
  if (value === null || value === undefined) return "NULL";
  return String(value);
}

function bool(value: boolean): string {
  return value ? "true" : "false";
}

type LeadRow = {
  industry: string;
  company_name: string;
  city: string | null;
  phone: string | null;
  rating: number | null;
  review_count: number | null;
  has_website: boolean;
  status: string;
  lead_source: string;
  lead_score: number;
  place_id: string;
  top_review: string | null;
  top_reviewer_name: string | null;
  notes: string | null;
};

const raw = await fs.readFile(IN, "utf-8");
const data: { industry: string; leads: LeadRow[] }[] = JSON.parse(raw);

await fs.mkdir(OUT_DIR, { recursive: true });

let totalLeads = 0;

for (const entry of data) {
  if (entry.leads.length === 0) continue;
  const values = entry.leads
    .map((lead) =>
      [
        quote(lead.company_name),
        quote(lead.city),
        quote(lead.industry),
        quote(lead.phone),
        num(lead.rating),
        num(lead.review_count),
        bool(lead.has_website),
        quote(lead.status),
        quote(lead.lead_source),
        num(lead.lead_score),
        quote(lead.place_id),
        quote(lead.top_review),
        quote(lead.top_reviewer_name),
        quote(lead.notes),
      ].join(", ")
    )
    .map((row) => `  (${row})`)
    .join(",\n");

  const sql = `INSERT INTO closehound.leads (
  company_name, city, industry, phone, rating, review_count,
  has_website, status, lead_source, lead_score, place_id,
  top_review, top_reviewer_name, notes
)
VALUES
${values}
ON CONFLICT (place_id) WHERE place_id IS NOT NULL DO NOTHING;`;

  const slug = entry.industry.replace(/\s+/g, "-");
  const path = `${OUT_DIR}/${slug}.sql`;
  await fs.writeFile(path, sql);
  console.log(`Wrote ${path} — ${entry.leads.length} leads.`);
  totalLeads += entry.leads.length;
}

console.log(`\nTotal: ${totalLeads} leads across ${data.length} industries.`);
