import "server-only";

// V1 cold outreach: plain text, short, single link, real human voice.
// Tracking pixels / fancy HTML are deliverability poison and read like a sales
// blast. The link IS the demo.

export type OutreachInputs = {
  companyName: string;
  city: string | null;
  previewUrl: string;
  senderFirstName: string;
  senderPhone: string | null;
};

function lowercaseFirstWord(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 4).join(" ");
}

export function buildOutreachSubject(companyName: string): string {
  // Lowercase, looks like a person typed it on their phone.
  return `quick site mockup for ${lowercaseFirstWord(companyName)}`;
}

export function buildOutreachBody(inputs: OutreachInputs): string {
  const { companyName, city, previewUrl, senderFirstName, senderPhone } = inputs;
  const cityClause = city ? ` over in ${city}` : "";
  return [
    `Hey — saw your reviews${cityClause} and put together a quick mockup of what a site for ${companyName} could look like.`,
    "",
    "Take a look:",
    previewUrl,
    "",
    "If you like the direction, reply yes and I can have it live on your domain in about a week. If not, no worries at all — toss it.",
    "",
    senderFirstName,
    senderPhone ?? "",
  ]
    .filter((line, idx, arr) => !(line === "" && arr[idx + 1] === ""))
    .join("\n");
}
