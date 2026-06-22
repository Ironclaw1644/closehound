import type { ClientDeal } from "@/components/screen/types";

function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build a CSV from underwritten deals and trigger a client-side download. */
export function downloadDealsCsv(deals: ClientDeal[], zip: string): void {
  const headers = [
    "Address", "ZIP", "Price", "Beds", "Baths", "Sqft", "YearBuilt",
    "PropertyType", "DaysOnMarket", "PriceCutFrom",
    "SAFMR_Rent", "NetCF_mo", "CashOnCash_pct", "CapRate_pct", "RentToPrice_pct", "DSCR", "DealScore",
  ];
  const rows = deals.map((d) => [
    d.listing.address, d.listing.zip, d.listing.price, d.listing.beds, d.listing.baths,
    d.listing.sqft, d.listing.yearBuilt,
    d.listing.propertyType, d.listing.daysOnMarket, d.listing.priceCutFrom,
    d.underwriting.grossRent, d.underwriting.netCashFlowMonthly,
    d.underwriting.cashOnCashPct, d.underwriting.capRatePct, d.underwriting.rentToPricePct,
    d.underwriting.dscr >= 999 ? "" : d.underwriting.dscr, d.underwriting.dealScore,
  ]);
  const csv = [headers, ...rows].map((r) => r.map(cell).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `closehound-${zip}-deals.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
