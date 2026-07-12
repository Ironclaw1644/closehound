"use client";

import { useEffect } from "react";
import { mountTourguide, type TourStep } from "@/lib/tourguide";

// The 5-step walkperro demo tour. Selectors are the data-tour anchors placed
// on the real pages (HomeView hero, MarketControls, Dashboard stage 2,
// SavedView main, AccountView card); tourguide skips a step gracefully if its
// selector isn't on the current page. `route` navigates before spotlighting.
// The app IS the demo, so the final "open the admin →" nudge lands on /screen.
const STEPS: TourStep[] = [
  {
    route: "/",
    selector: '[data-tour="hero"]',
    title: "the pitch",
    body: "closehound screens for-sale homes against hud section 8 voucher rents. the government check either beats the mortgage or it doesn't — this finds where it does.",
  },
  {
    route: "/screen",
    selector: '[data-tour="controls"]',
    title: "pick a market",
    body: "choose a graded metro — or type any zip — set bedrooms, hit run screen. try macon, ga: the demo data is warmed up there.",
  },
  {
    route: "/screen",
    selector: '[data-tour="deals"]',
    title: "the deal table",
    body: "tap a zip above and its listings get underwritten on the spot — deal score, cash-on-cash, cap rate. click a row for the full breakdown and hit save.",
  },
  {
    route: "/saved",
    selector: '[data-tour="saved"]',
    title: "your pipeline",
    body: "saved deals land here with a status lane — new, reviewing, offer, passed. this demo resets nightly, so go wild.",
  },
  {
    route: "/account",
    selector: '[data-tour="account"]',
    title: "plans + metering",
    body: "every screen is metered against a monthly allotment plus credits. billing runs on stripe in the real thing — disabled here.",
  },
];

/** Mounted from the root layout ONLY when DEMO_MODE=1. */
export function DemoTourguide() {
  useEffect(() => {
    mountTourguide({
      siteSlug: "ai-directory",
      adminUrl: "/screen",
      steps: STEPS,
    });
  }, []);
  return null;
}
