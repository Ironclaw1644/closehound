import "server-only";
import { isMockMode } from "@/lib/env";
import { hasSupabaseAdminEnv, getClosehoundAdminSchema } from "@/lib/supabase";
import { isFresh, TTL } from "@/lib/cache/ttl";
import { syntheticMarket, syntheticListings } from "@/lib/mock/synthetic";
import { recordCall } from "@/lib/metrics";
import { RentCastMarketSchema, RentCastListingsSchema } from "./schema";

const API = "https://api.rentcast.io/v1";

export interface MarketData {
  zip: string;
  bedrooms: number;
  medianSalePrice: number | null;
  medianRent: number | null;
}

export interface Listing {
  rentcastId: string;
  zip: string;
  address: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  yearBuilt: number | null;
  annualTax: number | null;
}

function authHeaders() {
  const key = process.env.RENTCAST_API_KEY;
  if (!key) throw new Error("RENTCAST_API_KEY missing");
  return { "X-Api-Key": key };
}

// ── Market data (median sale price + rent by ZIP + bedroom; 30-day TTL) ──────
export async function getMarketData(zip: string, bedrooms: number): Promise<MarketData> {
  const db = hasSupabaseAdminEnv() ? getClosehoundAdminSchema() : null;
  if (db) {
    const { data: cached } = await db
      .from("market_cache")
      .select("*")
      .eq("zip", zip)
      .eq("bedrooms", bedrooms)
      .maybeSingle();
    if (cached && isFresh(cached.fetched_at, TTL.market)) {
      recordCall("rentcast", "cache");
      return { zip, bedrooms, medianSalePrice: cached.median_sale_price, medianRent: cached.median_rent };
    }
  }

  const fresh = isMockMode() ? mockMarket(zip, bedrooms) : await liveMarket(zip, bedrooms);

  if (db) {
    await db.from("market_cache").upsert({
      zip,
      bedrooms,
      median_sale_price: fresh.medianSalePrice,
      median_rent: fresh.medianRent,
      fetched_at: new Date().toISOString(),
    });
  }
  return fresh;
}

function mockMarket(zip: string, bedrooms: number): MarketData {
  const m = syntheticMarket(zip, bedrooms);
  recordCall("rentcast", "mock");
  return { zip, bedrooms, medianSalePrice: m.median_sale_price, medianRent: m.median_rent };
}

async function liveMarket(zip: string, bedrooms: number): Promise<MarketData> {
  const res = await fetch(`${API}/markets?zipCode=${zip}&dataType=All`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RentCast markets ${res.status}`);
  recordCall("rentcast", "live");
  const parsed = RentCastMarketSchema.parse(await res.json());
  const saleByBed = parsed.saleData?.dataByBedrooms?.find((d) => d.bedrooms === bedrooms);
  const rentByBed = parsed.rentalData?.dataByBedrooms?.find((d) => d.bedrooms === bedrooms);
  return {
    zip,
    bedrooms,
    medianSalePrice: saleByBed?.medianPrice ?? parsed.saleData?.medianPrice ?? null,
    medianRent: rentByBed?.medianRent ?? parsed.rentalData?.medianRent ?? null,
  };
}

// ── Sale listings (24-hour TTL per ZIP) ──────────────────────────────────────
export async function getListings(zip: string): Promise<Listing[]> {
  const db = hasSupabaseAdminEnv() ? getClosehoundAdminSchema() : null;
  if (db) {
    const { data: rows } = await db
      .from("listings_cache")
      .select("*")
      .eq("zip", zip)
      .order("fetched_at", { ascending: false });
    if (rows && rows.length && isFresh(rows[0].fetched_at, TTL.listings)) {
      recordCall("rentcast", "cache");
      // Filter the negative-cache sentinel (an empty ZIP still counts as fresh).
      return rows
        .filter((r) => !r.rentcast_id.startsWith("__empty__"))
        .map((r) => ({
          rentcastId: r.rentcast_id,
          zip: r.zip,
          address: r.address,
          price: r.price,
          beds: r.beds,
          baths: r.baths,
          sqft: r.sqft,
          yearBuilt: r.year_built,
          annualTax: r.annual_tax,
        }));
    }
  }

  const fresh = isMockMode() ? mockListings(zip) : await liveListings(zip);

  if (db) {
    const now = new Date().toISOString();
    if (fresh.length) {
      await db.from("listings_cache").upsert(
        fresh.map((l) => ({
          rentcast_id: l.rentcastId,
          zip: l.zip,
          address: l.address,
          price: l.price,
          beds: l.beds,
          baths: l.baths,
          sqft: l.sqft,
          year_built: l.yearBuilt,
          annual_tax: l.annualTax,
          fetched_at: now,
        }))
      );
    } else {
      // Negative cache: don't re-bill RentCast for a known-empty ZIP within the TTL.
      await db.from("listings_cache").upsert({ rentcast_id: `__empty__:${zip}`, zip, fetched_at: now });
    }
  }
  return fresh;
}

function mockListings(zip: string): Listing[] {
  recordCall("rentcast", "mock");
  return syntheticListings(zip).map((l) => ({
    rentcastId: l.rentcast_id,
    zip: l.zip,
    address: l.address,
    price: l.price,
    beds: l.beds,
    baths: l.baths,
    sqft: l.sqft,
    yearBuilt: l.year_built,
    annualTax: l.annual_tax,
  }));
}

async function liveListings(zip: string): Promise<Listing[]> {
  const res = await fetch(`${API}/listings/sale?zipCode=${zip}&status=Active&limit=25`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RentCast listings ${res.status}`);
  recordCall("rentcast", "live");
  const parsed = RentCastListingsSchema.parse(await res.json());
  return parsed.map((l) => ({
    rentcastId: l.id,
    zip: l.zipCode ?? zip,
    address: l.formattedAddress ?? l.addressLine1 ?? null,
    price: l.price,
    beds: l.bedrooms,
    baths: l.bathrooms,
    sqft: l.squareFootage,
    yearBuilt: l.yearBuilt,
    annualTax: null,
  }));
}
