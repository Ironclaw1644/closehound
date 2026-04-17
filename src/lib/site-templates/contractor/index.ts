import {
  buildContractorSiteData,
  getContractorPreset,
} from "@/lib/site-templates/contractor/builder";
import { CONTRACTOR_SITE_EXAMPLES } from "@/lib/site-templates/contractor/examples";
import { CONTRACTOR_PRESETS } from "@/lib/site-templates/contractor/presets";
import type {
  ContractorSiteExample,
} from "@/lib/site-templates/contractor/types";

const EXAMPLE_BY_KEY = new Map<string, ContractorSiteExample>(
  CONTRACTOR_SITE_EXAMPLES.map((example) => [example.key, example])
);

export function getContractorSiteExample(key: string) {
  return EXAMPLE_BY_KEY.get(key);
}

export {
  CONTRACTOR_PRESETS,
  CONTRACTOR_SITE_EXAMPLES,
  buildContractorSiteData,
  getContractorPreset,
};

export type {
  ContractorGalleryItem,
  ContractorLocation,
  ContractorMediaAsset,
  ContractorNavItem,
  ContractorPreset,
  ContractorPresetKey,
  ContractorServiceItem,
  ContractorSiteData,
  ContractorSiteExample,
  ContractorStat,
  ContractorTheme,
  DeepPartial,
} from "@/lib/site-templates/contractor/types";
