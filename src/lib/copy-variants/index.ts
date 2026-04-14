export type AboutCopyVariant = {
  key: string;
  label: string;
  bodyTemplate: string;
};

export const ABOUT_COPY_VARIANTS = [
  {
    key: "credibility-first",
    label: "Credibility First",
    bodyTemplate:
      "{{companyName}} helps homeowners in {{city}} with reliable {{industryLabelLower}} work, clear communication, and practical recommendations that respect the property and the budget.",
  },
  {
    key: "local-owner-operator",
    label: "Local Owner Operator",
    bodyTemplate:
      "Built for people who want a straightforward local pro, {{companyName}} focuses on responsive service in {{city}}, honest timelines, and workmanship customers can feel good recommending to a neighbor.",
  },
  {
    key: "speed-and-convenience",
    label: "Speed And Convenience",
    bodyTemplate:
      "{{companyName}} is positioned as the easy call for {{city}} customers who want fast scheduling, simple quotes, and a clean, professional experience from the first message through the final walkthrough.",
  },
] as const satisfies readonly AboutCopyVariant[];

export type AboutCopyVariantKey = (typeof ABOUT_COPY_VARIANTS)[number]["key"];
