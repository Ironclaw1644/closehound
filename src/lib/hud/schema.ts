import { z } from "zod";

// HUD responses are loosely typed and field names vary by dataset/year, so we
// parse tolerantly and coerce. Only what we need is validated.

const num = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((v) => {
    if (v == null || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(/[,$]/g, ""));
    return Number.isFinite(n) ? n : null;
  });

/** USPS crosswalk (type=5, ZIP→CBSA). */
export const UspsCrosswalkSchema = z.object({
  data: z.object({
    results: z
      .array(z.object({ geoid: z.union([z.string(), z.number()]).transform(String) }))
      .default([]),
  }),
});

/** A SAFMR-by-ZIP row inside an FMR metro response. */
export const HudSafmrRowSchema = z
  .object({
    zip_code: z.union([z.string(), z.number()]).transform(String),
    "SAFMR 0BR": num,
    "SAFMR 1BR": num,
    "SAFMR 2BR": num,
    "SAFMR 3BR": num,
    "SAFMR 4BR": num,
    Efficiency: num,
    "One-Bedroom": num,
    "Two-Bedroom": num,
    "Three-Bedroom": num,
    "Four-Bedroom": num,
  })
  .partial({
    "SAFMR 0BR": true,
    "SAFMR 1BR": true,
    "SAFMR 2BR": true,
    "SAFMR 3BR": true,
    "SAFMR 4BR": true,
    Efficiency: true,
    "One-Bedroom": true,
    "Two-Bedroom": true,
    "Three-Bedroom": true,
    "Four-Bedroom": true,
  });

export const HudFmrResponseSchema = z.object({
  data: z.object({
    area_name: z.string().nullish(),
    basicdata: z.union([HudSafmrRowSchema, z.array(HudSafmrRowSchema)]).nullish(),
  }),
});

export type HudFmrResponse = z.infer<typeof HudFmrResponseSchema>;
