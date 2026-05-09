import "server-only";

// Google Places API (New) — Text Search + Place Details.
// We rely on https://places.googleapis.com/v1/places:searchText and
// https://places.googleapis.com/v1/places/{place_id}.
// Field-mask keeps cost down; only the fields we actually use are requested.

const PLACES_TEXT_SEARCH = "https://places.googleapis.com/v1/places:searchText";
const PLACES_DETAILS_BASE = "https://places.googleapis.com/v1/places/";

const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.types",
  "places.primaryType",
  "places.businessStatus",
  "places.location",
].join(",");

const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "addressComponents",
  "rating",
  "userRatingCount",
  "websiteUri",
  "nationalPhoneNumber",
  "businessStatus",
  "reviews",
].join(",");

export type PlaceSummary = {
  placeId: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  reviewCount: number | null;
  websiteUri: string | null;
  phone: string | null;
  primaryType: string | null;
  businessStatus: string | null;
};

export type PlaceDetails = PlaceSummary & {
  topReview: { text: string; authorFirstName: string; rating: number } | null;
};

function getApiKey(): string {
  // Prefer a Places-specific key if set, but fall back to the project-wide
  // Google API key (which works fine if Places API is enabled on the same GCP project).
  const key =
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    "";
  if (!key) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY (or GOOGLE_API_KEY with Places enabled) is not configured."
    );
  }
  return key;
}

type RawPlace = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: { longText?: string; shortText?: string; types?: string[] }[];
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  primaryType?: string;
  businessStatus?: string;
  reviews?: {
    rating?: number;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: { displayName?: string };
  }[];
};

function pickCityState(
  components: RawPlace["addressComponents"],
  fallbackAddress: string | null
): { city: string | null; state: string | null } {
  if (Array.isArray(components)) {
    let city: string | null = null;
    let state: string | null = null;
    for (const component of components) {
      const types = component.types ?? [];
      if (!city && types.includes("locality")) city = component.longText ?? null;
      if (!city && types.includes("postal_town")) city = component.longText ?? null;
      if (!state && types.includes("administrative_area_level_1")) {
        state = component.shortText ?? null;
      }
    }
    if (city || state) return { city, state };
  }
  if (!fallbackAddress) return { city: null, state: null };
  // Best-effort parse: "Address, City, ST 12345, USA"
  const parts = fallbackAddress.split(",").map((p) => p.trim());
  if (parts.length >= 3) {
    const stateZip = parts[parts.length - 2] ?? "";
    const stateMatch = stateZip.match(/\b([A-Z]{2})\b/);
    return {
      city: parts[parts.length - 3] ?? null,
      state: stateMatch ? stateMatch[1] : null,
    };
  }
  return { city: null, state: null };
}

function mapSummary(raw: RawPlace): PlaceSummary {
  const { city, state } = pickCityState(raw.addressComponents, raw.formattedAddress ?? null);
  return {
    placeId: raw.id,
    name: raw.displayName?.text ?? "(unnamed)",
    address: raw.formattedAddress ?? null,
    city,
    state,
    rating: raw.rating ?? null,
    reviewCount: raw.userRatingCount ?? null,
    websiteUri: raw.websiteUri ?? null,
    phone: raw.nationalPhoneNumber ?? raw.internationalPhoneNumber ?? null,
    primaryType: raw.primaryType ?? null,
    businessStatus: raw.businessStatus ?? null,
  };
}

function pickTopReview(reviews: RawPlace["reviews"]) {
  if (!Array.isArray(reviews) || reviews.length === 0) return null;
  const ranked = [...reviews].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  for (const review of ranked) {
    const text = review.text?.text ?? review.originalText?.text;
    if (!text) continue;
    const trimmed = text.trim();
    if (trimmed.length < 24 || trimmed.length > 320) continue;
    const author = review.authorAttribution?.displayName ?? "Verified customer";
    const firstName = author.split(/\s+/)[0] ?? author;
    return {
      text: trimmed,
      authorFirstName: firstName,
      rating: review.rating ?? 5,
    };
  }
  return null;
}

export async function searchPlaces(opts: {
  industry: string;
  city: string;
  state?: string;
  maxResults?: number;
}): Promise<PlaceSummary[]> {
  const apiKey = getApiKey();
  const limit = Math.max(5, Math.min(opts.maxResults ?? 40, 60));
  const query = `${opts.industry} in ${opts.city}${opts.state ? `, ${opts.state}` : ""}`;

  const res = await fetch(PLACES_TEXT_SEARCH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": SEARCH_FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: query,
      pageSize: limit,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Places search failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { places?: RawPlace[] };
  return (data.places ?? []).map(mapSummary);
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const apiKey = getApiKey();
  const url = `${PLACES_DETAILS_BASE}${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": DETAILS_FIELD_MASK,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Place details failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const raw = (await res.json()) as RawPlace;
  const summary = mapSummary(raw);
  return {
    ...summary,
    topReview: pickTopReview(raw.reviews),
  };
}
