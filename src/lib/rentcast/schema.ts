import { z } from "zod";

// RentCast responses parsed tolerantly — we extract only what we need.

const num = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((v) => {
    if (v == null || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  });

const ByBedrooms = z
  .object({
    bedrooms: num,
    medianPrice: num,
    averagePrice: num,
    medianRent: num,
    averageRent: num,
  })
  .partial();

export const RentCastMarketSchema = z.object({
  saleData: z
    .object({
      medianPrice: num,
      averagePrice: num,
      dataByBedrooms: z.array(ByBedrooms).default([]),
    })
    .partial()
    .nullish(),
  rentalData: z
    .object({
      medianRent: num,
      averageRent: num,
      dataByBedrooms: z.array(ByBedrooms).default([]),
    })
    .partial()
    .nullish(),
});

export const RentCastListingSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    formattedAddress: z.string().nullish(),
    addressLine1: z.string().nullish(),
    zipCode: z.union([z.string(), z.number()]).transform(String).nullish(),
    price: num,
    bedrooms: num,
    bathrooms: num,
    squareFootage: num,
    yearBuilt: num,
    // Fields the /listings/sale endpoint actually returns (verified live). NOTE:
    // it does NOT return property tax or last-sale price — those come only from
    // the separate /properties endpoint. `history` is listing/price history.
    propertyType: z.string().nullish(),
    daysOnMarket: num,
    history: z.record(z.string(), z.object({ price: num }).passthrough()).nullish(),
    taxAssessments: z.unknown().nullish(),
  })
  .passthrough();

export const RentCastListingsSchema = z.array(RentCastListingSchema);
export type RentCastListing = z.infer<typeof RentCastListingSchema>;

// /properties response — the per-property record (true tax + last sale).
// propertyTaxes is year-keyed: { "2023": { year, total } }.
export const RentCastPropertySchema = z
  .object({
    propertyTaxes: z.record(z.string(), z.object({ total: num }).passthrough()).nullish(),
    lastSalePrice: num,
    lastSaleDate: z.string().nullish(),
  })
  .passthrough();

export const RentCastPropertiesSchema = z.array(RentCastPropertySchema);
export type RentCastProperty = z.infer<typeof RentCastPropertySchema>;
