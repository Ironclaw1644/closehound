export type ContractorPresetKey = "underground-utility";

export type ContractorNavItem = {
  label: string;
  href: string;
};

export type ContractorTheme = {
  pageBackground: string;
  pageGradient: string;
  surface: string;
  surfaceAlt: string;
  surfaceStrong: string;
  heroPanel: string;
  heroText: string;
  heading: string;
  body: string;
  muted: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  border: string;
  footerBackground: string;
};

export type ContractorMediaAsset = {
  src: string;
  alt: string;
};

export type ContractorLocation = {
  label: string;
  addressLine1?: string;
  city: string;
  state: string;
  postalCode?: string;
};

export type ContractorServiceItem = {
  title: string;
  description: string;
};

export type ContractorGalleryItem = {
  title: string;
  category: string;
  caption: string;
  image: ContractorMediaAsset;
};

export type ContractorStat = {
  value: string;
  label: string;
};

export type ContractorHighlightCard = {
  eyebrow: string;
  title: string;
  body: string;
  quote?: string;
  attribution?: string;
  image?: ContractorMediaAsset;
};

export type ContractorSiteData = {
  presetKey: ContractorPresetKey;
  slug: string;
  company: {
    name: string;
    legalName?: string;
    phone: string;
    email: string;
    logo?: ContractorMediaAsset;
    primaryLocation: ContractorLocation;
    additionalLocations: ContractorLocation[];
    serviceArea: string[];
  };
  branding: {
    headerTitle: string;
    headerSubtitle: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    navItems: ContractorNavItem[];
    theme: ContractorTheme;
  };
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    image: ContractorMediaAsset;
    supportingImages: ContractorMediaAsset[];
    stats: ContractorStat[];
    trustItems: string[];
  };
  services: {
    heading: string;
    body: string;
    items: ContractorServiceItem[];
  };
  gallery: {
    heading: string;
    body: string;
    images: ContractorGalleryItem[];
  };
  trust: {
    heading: string;
    body: string;
    bullets: string[];
    highlight: ContractorHighlightCard;
  };
  contact: {
    heading: string;
    body: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  footer: {
    summary: string;
    coverageHeading: string;
    coverageItems: string[];
    note?: string;
  };
  seo: {
    title: string;
    description: string;
  };
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export type ContractorPreset = {
  key: ContractorPresetKey;
  label: string;
  description: string;
  defaults: ContractorSiteData;
};

export type ContractorSiteExample = {
  key: string;
  label: string;
  description: string;
  data: ContractorSiteData;
};
