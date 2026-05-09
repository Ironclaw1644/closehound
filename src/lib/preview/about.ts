import type { LeadIndustry } from "@/lib/industries";

export type AboutCopy = {
  // 2–3 short paragraphs forming the story.
  paragraphs: (
    company: string,
    city: string | null,
    yearsInBusiness: number | null
  ) => string[];
  // Trust badges (industry-specific certifications + insurance copy).
  badges: string[];
  // The "why we exist" tagline that anchors the page.
  tagline: string;
};

const ageBlurb = (years: number | null): string => {
  if (!years || years < 1) return "We've been on this since the day we hung the sign.";
  if (years === 1) return "We've been on this for over a year now.";
  return `We've been on this for ${years} years.`;
};

const cityOrArea = (city: string | null) => city ?? "this area";

export const ABOUT_COPY: Record<LeadIndustry, AboutCopy> = {
  handyman: {
    tagline: "Small repairs, big difference.",
    paragraphs: (company, city, years) => [
      `${company} runs the kind of handyman crew you'd want as a neighbor — show up when we say, do what we said, and leave the place cleaner than we found it. ${ageBlurb(years)}`,
      `We started this because most homeowners in ${cityOrArea(city)} weren't avoiding repairs because they didn't care; they were avoiding them because the experience of hiring help was painful. The window-of-time was four hours, the bill never matched the quote, the trim never quite got finished.`,
      `So we built the opposite. Two-hour arrival window. Photo of the tech before they pull up. Flat-rate quote you see before any tools come out. Drop cloths down. Mess gone. Punch-list walked before we leave.`,
    ],
    badges: ["General liability insured", "Background-checked technicians", "Locally owned"],
  },
  "pressure washing": {
    tagline: "Curb appeal, restored.",
    paragraphs: (company, city, years) => [
      `${company} does pressure washing right — soft-wash chemistry on siding, surface-cleaner on concrete, careful around landscaping. ${ageBlurb(years)}`,
      `What we don't do: blast paint off your trim, fuzz up your deck boards, or carve permanent lines into your driveway. Pressure cleaning is chemistry first, horsepower second.`,
      `We rinse landscaping before and after, work fast, and send before/after photos when we're done. Most ${cityOrArea(city)} homes look freshly painted by lunchtime.`,
    ],
    badges: ["IICRC soft-wash certified", "Fully insured", "Plant-and-pet safe detergents"],
  },
  roofing: {
    tagline: "Roofs that outlast the warranty.",
    paragraphs: (company, city, years) => [
      `${company} is a roofing crew that does the work the right way once. We climb up, take photos, and walk you through what we found in plain English. No high-pressure sit-down sales. ${ageBlurb(years)}`,
      `Repairs and replacements both follow the same standard: synthetic underlayment, proper ice-and-water shield where needed, ventilation balanced, drip edge installed. The shingle is the easy part — what's underneath is what makes it last.`,
      `Most ${cityOrArea(city)} replacements are a 1-day install. We pull the permit, schedule the inspection, and hand you the closed permit number when it's done.`,
    ],
    badges: ["GAF Master Elite installer", "5-year labor warranty", "Manufacturer-certified"],
  },
  HVAC: {
    tagline: "Comfort, the same day.",
    paragraphs: (company, city, years) => [
      `${company} runs an HVAC crew built around one promise: when something breaks, you talk to a person, get a tech that day, and get a flat-rate price before any work starts. ${ageBlurb(years)}`,
      `Our techs are NATE-certified, in uniform, background-checked. The diagnostic is photo-documented and emailed to you. We don't push system replacements for repairs that should be repairs.`,
      `Average arrival time across ${cityOrArea(city)} is 47 minutes. 92% of repairs are done same-day. The rest are next-morning with parts pre-staged on the truck.`,
    ],
    badges: ["NATE-certified technicians", "EPA 608 universal", "Manufacturer-trained"],
  },
  plumbing: {
    tagline: "We answer at 9pm.",
    paragraphs: (company, city, years) => [
      `${company} is a plumbing shop where the phone gets answered live, the master plumber leads the truck, and every visit ends with a clean kitchen. ${ageBlurb(years)}`,
      `Every plumber on staff carries an active state license. We pull permits on work that requires them — even when the homeowner doesn't ask — because your insurance, resale, and inspection records all need to line up the day you sell.`,
      `${cityOrArea(city)} runs on us for leaks, burst pipes, water heater swaps, and the slow drain everyone in the house has been ignoring. Service calls land same-week; emergencies same-day.`,
    ],
    badges: ["Master-plumber-led", "Licensed · bonded · insured", "Permit-pulled work"],
  },
  dental: {
    tagline: "On time. No surprises.",
    paragraphs: (company, city, years) => [
      `${company} is a family dental practice that runs on respect for your time and your bill. Cleanings start when they were supposed to start. The treatment plan is shown to you on a screen. The cost is explained line by line. ${ageBlurb(years)}`,
      `Dr. and the team focus on conservative dentistry first: keep teeth as long as we can, replace only when we must, never recommend a treatment we wouldn't accept on our own family.`,
      `${cityOrArea(city)} families have made us their dental home because we treat the front desk, the hygienist, and the chair-side experience like the same job: don't waste anyone's time, don't surprise anyone with a bill, and explain everything before we touch a tooth.`,
    ],
    badges: ["ADA-member dentist", "Most PPO insurance accepted", "Saturday hours"],
  },
  "med spa": {
    tagline: "Subtle, on purpose.",
    paragraphs: (company, city, years) => [
      `${company} is a small medical aesthetics practice anchored on three principles: conservative dosing, posted pricing, and a clinical team that doesn't oversell. ${ageBlurb(years)}`,
      `Every treatment plan is reviewed by our medical director. Per-unit pricing is read aloud at the consult, before any decisions get made. We'd rather see you back for a touch-up than push too hard once.`,
      `${cityOrArea(city)} clients come to us because the work doesn't announce itself. Friends ask what changed. The honest answer is "nothing dramatic" — and that's the goal.`,
    ],
    badges: ["MD-supervised", "Board-certified injectors", "Conservative-dosing protocol"],
  },
  "junk removal": {
    tagline: "Gone by lunch.",
    paragraphs: (company, city, years) => [
      `${company} is a two-truck junk removal outfit that prices flat by the load, donates and recycles where it makes sense, and shows up when we said we would. ${ageBlurb(years)}`,
      `Snap a photo of the pile. We text back a flat-rate inside 15 minutes. Two-person crew, big truck, on-route texts the day of. We do the carrying.`,
      `${cityOrArea(city)} estate cleanouts, garage cleanouts, post-renovation debris, the tenant-left-it-all situation. We've done it all. Items that can be donated go to a local charity (with a receipt for you). Recycle-able items get diverted from landfill where we can.`,
    ],
    badges: ["Donation receipts available", "Same-day service", "Locally owned"],
  },
  "mobile detailing": {
    tagline: "We bring the shop to your driveway.",
    paragraphs: (company, city, years) => [
      `${company} is a mobile detailing rig — water tank, generator, vacuum, lights — that pulls into your driveway and takes a tired car back to dealer-clean while you keep working. ${ageBlurb(years)}`,
      `Foam wash, clay if it needs it, paint correction in stages, interior steam, sealant or ceramic. Photos as we go. Walk-around at the end. If you find a missed spot, we fix it before we pull off.`,
      `Most ${cityOrArea(city)} cars are a 3-hour appointment for a full detail. Trucks and three-row SUVs add an hour. We confirm by text the day before and on the morning of.`,
    ],
    badges: ["IDA-certified detailer", "Self-contained rig", "Insured up to $1M / job"],
  },
  landscaping: {
    tagline: "The best yard on the block.",
    paragraphs: (company, city, years) => [
      `${company} is a landscape crew that runs ${cityOrArea(city)} on a fixed weekly route — same two people, same day every week, same arrival window. The kind of consistency that makes a yard quietly look better than the others on the block. ${ageBlurb(years)}`,
      `Our work is the boring stuff done right: stick-edged drives, blown sidewalks, weeded beds, hedges shaped for the species, mulch refreshed twice a year. The cut itself is the smallest part — what sells the cut is the edges.`,
      `Month-to-month service. Cancel anytime. We'd rather earn next month than lock you in.`,
    ],
    badges: ["Licensed + insured", "Workers' comp on every employee", "Drought-aware practices"],
  },
  painting: {
    tagline: "Walls done right.",
    paragraphs: (company, city, years) => [
      `${company} is a painting studio that obsesses over the parts of the job that come before the brush touches the wall — sanding, patching, priming, taping, masking. ${ageBlurb(years)}`,
      `Premium paint included. Sherwin-Williams Emerald or Benjamin Moore Aura on every interior, manufacturer-rated exterior on every outside job. We don't bait-and-switch with builder-grade at the back of the truck.`,
      `${cityOrArea(city)} clients come from neighbor referrals — somebody points at a house and asks who painted it. That's the sales funnel.`,
    ],
    badges: ["PCA-member painter", "$2M general liability", "Premium paint included"],
  },
  electrical: {
    tagline: "Licensed. Permitted. On site this week.",
    paragraphs: (company, city, years) => [
      `${company} is a master-electrician-led shop. Every truck has a state-licensed master on board. Every job site has photos of the finished panel. Every permit gets pulled. ${ageBlurb(years)}`,
      `Our work is built around documentation: dated photos before, during, and after; labeled breakers; closed permit numbers handed off to you for your records and resale.`,
      `Service calls book inside three business days across ${cityOrArea(city)}. Emergencies — sparking, smoke, dead panel — get same-day priority dispatch.`,
    ],
    badges: ["State-licensed master electrician", "$2M general liability", "NEC-current installs"],
  },
  "auto repair": {
    tagline: "Dealer work. Independent price.",
    paragraphs: (company, city, years) => [
      `${company} is an independent shop that does dealer-quality diagnosis and repair without the dealer markup. ASE-certified techs on the floor, OEM-grade parts on the bench, written quotes before any work starts. ${ageBlurb(years)}`,
      `Every job comes with a digital inspection — photos and video of the worn part — texted to your phone. You decide what gets fixed. We don't push repairs to hit shop labor targets.`,
      `${cityOrArea(city)} drivers leave the dealer for us because we explain things, charge fairly, and back our work with a 2-year / 24K-mile warranty on parts and labor.`,
    ],
    badges: ["ASE-certified technicians", "AAA-approved shop", "2-yr / 24K-mile warranty"],
  },
  "pest control": {
    tagline: "Out. And gone for good.",
    paragraphs: (company, city, years) => [
      `${company} runs a quarterly perimeter program with the same tech every visit, family-and-pet-safe products, and free re-treats between scheduled visits. ${ageBlurb(years)}`,
      `Every applicator on staff carries a state pest-control license and recertifies annually. We use the same low-impact formulations licensed for daycares and food-service kitchens — products dry inside 30 minutes, no four-hour reentry windows.`,
      `${cityOrArea(city)} families stay with us because the program holds. If activity comes back between visits, we come back free.`,
    ],
    badges: ["State-licensed applicators", "QualityPro company", "Family + pet safe"],
  },
};

export function getAboutForIndustry(industry: LeadIndustry): AboutCopy {
  return ABOUT_COPY[industry];
}
