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
    taxAssessments: z.unknown().nullish(),
  })
  .passthrough();

export const RentCastListingsSchema = z.array(RentCastListingSchema);
export type RentCastListing = z.infer<typeof RentCastListingSchema>;
