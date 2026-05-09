import type { LeadIndustry } from "@/lib/industries";
import { getCopyForIndustry } from "@/lib/preview/copy";
import { getPaletteForIndustry } from "@/lib/preview/palettes";
import { getStockImagesForIndustry } from "@/lib/images/industry-stock.generated";
import type { PreviewModel } from "@/lib/preview/types";

type SampleBusiness = {
  name: string;
  city: string;
  phoneDisplay: string;
  rating: number;
  reviewCount: number;
  yearsInBusiness: number;
  topReview: {
    quote: string;
    author: string;
    rating: number;
  };
};

const SAMPLE_BY_INDUSTRY: Record<LeadIndustry, SampleBusiness> = {
  handyman: {
    name: "Riverside Handy",
    city: "Asheville",
    phoneDisplay: "(828) 555-0142",
    rating: 4.9,
    reviewCount: 187,
    yearsInBusiness: 9,
    topReview: {
      quote:
        "Texted at 8am, on the porch by 10. Mounted three TVs, fixed the squeaky door we'd ignored for two years, and even rehung a picture I'd given up on.",
      author: "Marisa",
      rating: 5,
    },
  },
  "pressure washing": {
    name: "Bright Side Wash Co.",
    city: "Charleston",
    phoneDisplay: "(843) 555-0118",
    rating: 4.9,
    reviewCount: 256,
    yearsInBusiness: 7,
    topReview: {
      quote:
        "Our siding looked twenty years old. Three hours later it looked brand new. The driveway is what really sold the neighbors — they all called the next week.",
      author: "Daniel",
      rating: 5,
    },
  },
  roofing: {
    name: "Hartwell Roofing",
    city: "Raleigh",
    phoneDisplay: "(919) 555-0173",
    rating: 4.9,
    reviewCount: 412,
    yearsInBusiness: 22,
    topReview: {
      quote:
        "After the storm, three companies tried to sell me a full replacement. Hartwell sent a guy up, took photos, and showed me only six shingles needed work. Honest people are rare.",
      author: "James",
      rating: 5,
    },
  },
  HVAC: {
    name: "Northline Heating & Air",
    city: "Charlotte",
    phoneDisplay: "(704) 555-0166",
    rating: 4.8,
    reviewCount: 538,
    yearsInBusiness: 14,
    topReview: {
      quote:
        "AC died on the hottest day of the year. Called at 2pm, tech was here by 4, fixed by 5. Flat-rate price was the same as quoted on the phone. No drama.",
      author: "Renee",
      rating: 5,
    },
  },
  plumbing: {
    name: "Cobblestone Plumbing",
    city: "Savannah",
    phoneDisplay: "(912) 555-0149",
    rating: 4.9,
    reviewCount: 309,
    yearsInBusiness: 18,
    topReview: {
      quote:
        "Burst pipe at 9 on a Sunday night. He was here in forty minutes, water back on in two hours, and the kitchen was cleaner than when he started. We've used them for everything since.",
      author: "Patricia",
      rating: 5,
    },
  },
  dental: {
    name: "Magnolia Family Dentistry",
    city: "Athens",
    phoneDisplay: "(706) 555-0184",
    rating: 4.9,
    reviewCount: 421,
    yearsInBusiness: 12,
    topReview: {
      quote:
        "I have not had a dentist treat me this well in twenty years. They explained every step, the front desk handled my insurance like a guardian angel, and my kid actually wants to go back.",
      author: "Lauren",
      rating: 5,
    },
  },
  "med spa": {
    name: "Veil & Verve Aesthetics",
    city: "Nashville",
    phoneDisplay: "(615) 555-0127",
    rating: 4.9,
    reviewCount: 198,
    yearsInBusiness: 6,
    topReview: {
      quote:
        "My friends keep asking what I changed. I keep saying nothing. The injector talked me out of three things I thought I wanted, and the result is the most natural I have ever looked.",
      author: "Sloane",
      rating: 5,
    },
  },
  "junk removal": {
    name: "Big Truck Cleanouts",
    city: "Nashville",
    phoneDisplay: "(615) 555-0156",
    rating: 4.9,
    reviewCount: 612,
    yearsInBusiness: 8,
    topReview: {
      quote:
        "Three estimates, theirs was the cheapest AND they showed up first. Two guys, ninety minutes, garage swept clean. I'm telling everyone in my HOA group.",
      author: "Greg",
      rating: 5,
    },
  },
  "mobile detailing": {
    name: "Apex Mobile Detail",
    city: "Austin",
    phoneDisplay: "(512) 555-0193",
    rating: 5.0,
    reviewCount: 274,
    yearsInBusiness: 5,
    topReview: {
      quote:
        "Dropped my keys, went back to my Zoom calls. Three hours later my F-150 looked better than the day I bought it. The interior smells incredible. I've already booked them for next month.",
      author: "Tomás",
      rating: 5,
    },
  },
  landscaping: {
    name: "Cedar Line Landscape Co.",
    city: "Greenville",
    phoneDisplay: "(864) 555-0179",
    rating: 4.9,
    reviewCount: 348,
    yearsInBusiness: 11,
    topReview: {
      quote:
        "Switched to them after three other crews and the difference is night and day. Same two guys every Tuesday, edges sharp, beds always weeded. Our yard sets the tone for the whole street now.",
      author: "Hannah",
      rating: 5,
    },
  },
  painting: {
    name: "North & Maple Painting",
    city: "Portland",
    phoneDisplay: "(503) 555-0118",
    rating: 4.9,
    reviewCount: 219,
    yearsInBusiness: 13,
    topReview: {
      quote:
        "We had three quotes and they weren't the cheapest, but the consult told us they were the right call. Five days, four rooms, zero touch-ups needed. Worth every dollar.",
      author: "Eliza",
      rating: 5,
    },
  },
  electrical: {
    name: "Foundry Electric",
    city: "Denver",
    phoneDisplay: "(720) 555-0142",
    rating: 4.9,
    reviewCount: 287,
    yearsInBusiness: 16,
    topReview: {
      quote:
        "Panel was original to the 1962 build. They permitted, swapped it, and pulled in the EV charger in one day. Inspection passed first try. Photo of the labeled panel is going on the fridge.",
      author: "Marcus",
      rating: 5,
    },
  },
  "auto repair": {
    name: "Westside Auto Works",
    city: "Phoenix",
    phoneDisplay: "(602) 555-0188",
    rating: 4.9,
    reviewCount: 642,
    yearsInBusiness: 19,
    topReview: {
      quote:
        "Saved me $1,400 the dealer wanted for a transmission flush I didn't need. Texted me a video of the actual fluid showing it was clean. That kind of honesty is why I drove forty minutes here.",
      author: "Devon",
      rating: 5,
    },
  },
  "pest control": {
    name: "Hatchwood Pest Defense",
    city: "Tampa",
    phoneDisplay: "(813) 555-0167",
    rating: 4.9,
    reviewCount: 511,
    yearsInBusiness: 9,
    topReview: {
      quote:
        "We had German roaches from a moving box. Three other companies told us a six-month plan. Hatchwood's tech baited the kitchen properly the first visit and they were gone in two weeks. Quarterly service since.",
      author: "Adriana",
      rating: 5,
    },
  },
};

export function buildSamplePreviewModel(industry: LeadIndustry): PreviewModel {
  const sample = SAMPLE_BY_INDUSTRY[industry];
  const copy = getCopyForIndustry(industry);
  const palette = getPaletteForIndustry(industry);
  const phoneDigits = sample.phoneDisplay.replace(/\D/g, "");
  const phoneTelHref = `tel:+1${phoneDigits.slice(-10)}`;

  return {
    slug: `sample-${industry.replace(/\s+/g, "-")}`,
    industry,
    templateKey: copy.templateKey,
    paletteKey: palette.key,
    business: {
      name: sample.name,
      city: sample.city,
      phoneDisplay: sample.phoneDisplay,
      phoneTelHref,
      rating: sample.rating,
      reviewCount: sample.reviewCount,
      yearsInBusiness: sample.yearsInBusiness,
    },
    hero: {
      eyebrow: copy.hero.eyebrow(sample.city),
      headline: copy.hero.headline(sample.name, sample.city),
      subheadline: copy.hero.subheadline(sample.name, sample.city),
      primaryCta: { label: copy.hero.primaryCtaLabel, href: phoneTelHref },
      secondaryCta: copy.hero.secondaryCtaLabel
        ? { label: copy.hero.secondaryCtaLabel, href: "#contact" }
        : null,
    },
    topReview: {
      quote: sample.topReview.quote,
      authorFirstName: sample.topReview.author,
      rating: sample.topReview.rating,
    },
    services: copy.services,
    serviceArea: {
      heading: copy.serviceArea.heading,
      body: copy.serviceArea.body(sample.name, sample.city),
    },
    whyUs: copy.whyUs,
    faq: {
      heading: copy.faq.heading,
      items: copy.faq.items(sample.name, sample.city),
    },
    contact: {
      heading: copy.contact.heading(sample.name),
      body: copy.contact.body(sample.name, sample.city),
    },
    assets: (() => {
      const stock = getStockImagesForIndustry(industry);
      return {
        logoUrl: null,
        heroUrl: stock.hero || null,
        galleryUrls: stock.gallery,
      };
    })(),
    buy: {
      headline: "Own this site for your business.",
      subhead:
        "We deliver a live website on your domain within 7 days, with hosting, SSL, contact form, and Google Business connection.",
      priceLabel: "$497 one-time",
      ctaLabel: "Buy this site · $497 one-time",
      href: `/api/buy/sample-${industry.replace(/\s+/g, "-")}`,
    },
  };
}
