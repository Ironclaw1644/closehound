import type { LeadIndustry } from "@/lib/industries";

// Stock image slots are pregenerated once per industry and reused across every
// preview in that industry. The library runs the prompts through Nano Banana 2
// (Gemini 2.5 Flash Image), uploads the bytes to Supabase Storage, and the
// public URLs land in `industry-stock.generated.ts`.

export type StockSlot = "hero" | "actionShot" | "detailShot" | "scenicShot";

export const STOCK_SLOTS: StockSlot[] = ["hero", "actionShot", "detailShot", "scenicShot"];

const REALISM_FOOTER =
  "Cinematic, real photography, natural lighting, neutral palette. No text overlays, no watermarks, no logos, no fake brand names. No AI artifacts, no surreal lighting, no oversaturated colors.";

type IndustryStockPrompts = Record<StockSlot, string>;

export const STOCK_PROMPTS: Record<LeadIndustry, IndustryStockPrompts> = {
  handyman: {
    hero:
      "Wide editorial photograph of a friendly American handyman in a clean denim shirt and tool belt working in a bright suburban living room, soft natural daylight through a window, a homeowner watching from the doorway with arms crossed and a warm expression, neutral cream and oak palette, 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Editorial photograph of a handyman's hands smoothing fresh joint compound onto a drywall patch in a hallway, putty knife visible, mid-action, gentle window light, slight motion blur. 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a finished mounted flat-screen TV on a freshly painted wall, perfectly level, cable cover hiding wires, soft afternoon light. Neutral suburban living room visible at the edges. 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a clean, organized open toolbox sitting on a hardwood floor next to a freshly repaired baseboard, with light pouring through nearby blinds, neutral cream walls, lived-in suburban American home. 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  "pressure washing": {
    hero:
      "Editorial wide photograph of a contractor in a navy uniform pressure-washing the lower vinyl siding of a two-story American suburban house, mid-day sun, half-clean and half-dirty siding showing dramatic before-and-after contrast, water spray fan visible, no people facing camera. 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a long stone-paver driveway being pressure-washed: the half closer to the camera is bright and clean, the far half is grey-green algae-stained. Wand held by gloved hands, water arcing. 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a wood deck mid-restoration: left half greyed and weathered, right half rich golden cedar after soft-wash treatment, water droplets on the boards. 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of an American suburban home's freshly cleaned exterior under late-afternoon sun, white siding, charcoal shutters, neat lawn, no people. 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  roofing: {
    hero:
      "Editorial wide photograph of a small roofing crew installing architectural asphalt shingles on a modest American single-family home, clear blue sky, professional uniforms with no visible logos, ladder leaning against the eave, sunlight raking across the roof plane. 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a roofer's gloved hands nailing a charcoal architectural shingle into place, hammer mid-swing, exposed underlayment visible at the edge, bright morning sun. 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a freshly installed ridge cap on a charcoal-shingle roof, drip edge visible, crisp lines, blue sky behind. 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a finished new roof on a craftsman-style American home, golden hour light, clean ridge line, gutter installed, no people, suburban street visible at the edge. 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  HVAC: {
    hero:
      "Editorial wide photograph of an HVAC technician in a clean uniform servicing a modern outdoor air conditioning condenser at a suburban American home, daylight, tools laid out neatly on a cloth, gauges and a multimeter visible. 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a technician's hand using a refrigerant gauge manifold attached to an HVAC condenser, gauge needle in focus, copper line set in soft focus behind. 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a clean modern thermostat mounted on a neutral painted wall reading 72 degrees, soft natural light from a side window. 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a tidy basement utility space with a new high-efficiency furnace and water heater installed, exposed copper lines, no boxes or clutter, soft cool light. 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  plumbing: {
    hero:
      "Editorial wide photograph of a licensed American plumber under a kitchen sink in a bright suburban home, headlamp on, wrench in hand, clean toolkit beside, copper pipes visible, neutral palette. 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a plumber's gloved hand soldering a copper pipe joint with a small torch, bright orange flame, water lines feeding into a wall. 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a freshly installed brushed-nickel kitchen faucet on a quartz countertop, water bead on the spout, soft natural light. 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a tidy garage utility area with a brand-new tankless water heater installed on the wall, neat copper supply lines, gas line, no clutter, daylight from a small window. 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  dental: {
    hero:
      "Editorial wide photograph of the bright, modern reception of a small American family dental office, neutral wood, soft daylight, plants, a friendly receptionist behind a counter (face turned away from camera), no logos or text on signage. 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a dental hygienist's gloved hands holding a polished dental mirror near a patient's chin, soft warm overhead light, mid-cleaning, modern operatory in soft focus, no faces clearly visible. 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a clean dental tray with sterile instruments laid out on a fresh blue paper drape, warm clinic light, no text on packaging. 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a modern dental operatory with a chair, overhead light arm, and a small plant on the counter, soft natural light from a window, neutral wood and white palette, no people. 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  "med spa": {
    hero:
      "Editorial wide photograph of the calm interior of a small American med spa treatment room, warm afternoon light, white linens on a treatment bed, single eucalyptus plant, neutral oak floor, no faces, no logos. 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a licensed injector's gloved hands gently holding a fine syringe near a client's cheek (face mostly out of frame, only chin visible), soft beauty-clinic lighting, neutral linen drape. 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a tidy med spa product shelf: unbranded skincare bottles with simple labels, dropper, towel, soft sand-tone background. 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a serene med spa relaxation lounge with a chaise, herbal tea on a side table, dim warm lighting, large window with soft sheer curtain, no people. 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  "junk removal": {
    hero:
      "Editorial wide photograph of two friendly American workers in matching plain navy T-shirts loading furniture and a cleanout pile from a garage into a large white box truck on a suburban driveway, daylight, no text or logos visible. 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of two workers carrying an old couch out of a garage into a box truck, mid-action, garage half-cleaned, sunlight slanting in. 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Photograph of a freshly emptied and broom-swept American suburban garage floor, painted concrete, light streaming in through the open garage door, no furniture or boxes left. 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of the back of a clean, plain white box truck parked in a suburban American driveway, ramp down, neat stacks of donatable furniture inside, no logos, soft afternoon light. 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  "mobile detailing": {
    hero:
      "Editorial wide photograph of a mobile auto-detailing setup in a residential American driveway: foam-coated dark sedan, microfiber towels on the hood, water tank visible on the side of the work truck, late-afternoon sun creating reflections on the wet paint, no people on camera. 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of gloved hands using a foam pad on a dual-action polisher to correct paint on a glossy black car panel, swirl marks fading, garage shop lighting overhead. 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a freshly detailed dark leather car interior: stitched seat, polished trim, deep matte dashboard, no people, golden side window light. 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a finished, just-detailed dark sedan in a suburban driveway at dusk, deep wet-look gloss, beads of water still on the hood, headlights subtly catching the last sun. 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  landscaping: {
    hero:
      "Editorial wide photograph of a freshly mowed and edged American suburban front yard at golden hour, a perfectly stick-edged driveway line, neat boxwood hedges along the bed, mulched flower beds with seasonal annuals, no people, deep green grass with mow stripes, 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a landscaper mid-action edging the line between a stone driveway and a green lawn with a stick edger, slight motion blur on a thin arc of grass clippings, morning light, 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of fresh dark hardwood mulch newly spread around the base of a flowering hosta and a clean stone bed border, dappled afternoon light, droplets on the leaves, 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a manicured American suburban backyard at sunset: cut grass with visible mow lines, trimmed hedges along the fence, a stone patio with two lounge chairs, no people, warm late-day light, 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  painting: {
    hero:
      "Editorial wide photograph of a professional house painter in clean white painter's overalls cutting a crisp line at the ceiling of a freshly painted bright living room, drop cloths on hardwood floor, taped baseboards, soft daylight from a tall window, neutral and warm palette, no logos, 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a painter rolling a paint roller down a freshly painted off-white wall in a sunlit room, paint tray on a drop cloth in foreground, slight motion blur on the roller, 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a fresh paint can with the lid off and a clean angled brush resting on the rim, color sample swatches fanned out on a wood floor next to it, soft natural light, 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of the freshly painted exterior of a craftsman-style American home in a deep charcoal with crisp white trim, late-afternoon sun, neat landscaping, no people, 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  electrical: {
    hero:
      "Editorial wide photograph of a master electrician in a clean uniform working at an open residential electrical panel, neatly dressed wires, breakers labeled clearly, headlamp casting focused light, professional toolbag visible, suburban American basement utility room, 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a gloved electrician's hand using a digital multimeter at an outlet box, multimeter display reading 120 volts, wires emerging from a metal outlet box, focused work light, 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a freshly installed Level 2 EV charger mounted to the wall of a clean American suburban garage, neat conduit running up to the breaker panel, charge cable holstered, soft daylight from the open garage door, 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a freshly upgraded residential electrical panel: every breaker labeled with crisp printed labels, neutral and ground bars dressed flat, no clutter, cool basement light, 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  "auto repair": {
    hero:
      "Editorial wide photograph of a clean professional American auto-repair shop interior, polished epoxy floor, a sedan up on a four-post lift in soft focus background, a technician in a navy uniform working on the front suspension in foreground, organized tool boxes, daylight through high bay windows, no logos, 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a technician's hands with a torque wrench tightening a lug nut on a wheel hub, brake rotor visible, brand-new pads in the caliper, shop lighting, 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a clean OBD-II diagnostic scanner in a technician's gloved hand, screen showing a vehicle systems readout, blurred engine bay in background, 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a clean, organized professional auto-repair bay with a sedan on a lift, tools laid out neatly on a rolling cart, no people, warm shop lighting, no logos or brand names, 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
  "pest control": {
    hero:
      "Editorial wide photograph of a licensed pest-control technician in a clean polo and cargo pants treating the perimeter of a suburban American home with a backpack sprayer, golden afternoon sun, neat landscaping, no people in foreground beyond the tech, no logos, 16:9 aspect ratio. " +
      REALISM_FOOTER,
    actionShot:
      "Photograph of a technician's gloved hands placing a discreet rodent bait station against the foundation of a suburban home, well-trimmed grass, focused composition, soft daylight, 4:3 aspect ratio. " +
      REALISM_FOOTER,
    detailShot:
      "Close-up photograph of a clean modern pest-control service truck side panel with no branding, professional cargo organization visible through the open door: sealed bottles, sprayer wand, gloves, neutral palette, 4:5 aspect ratio. " +
      REALISM_FOOTER,
    scenicShot:
      "Photograph of a treated suburban American front yard at dusk: clean perimeter, healthy lawn, no insects visible, glow of porch light coming on, no people, 3:2 aspect ratio. " +
      REALISM_FOOTER,
  },
};

export function buildStockPrompt(industry: LeadIndustry, slot: StockSlot): string {
  return STOCK_PROMPTS[industry][slot];
}
