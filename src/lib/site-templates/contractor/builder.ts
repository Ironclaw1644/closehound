import { CONTRACTOR_PRESETS } from "@/lib/site-templates/contractor/presets";
import type {
  ContractorPreset,
  ContractorPresetKey,
  ContractorSiteData,
  DeepPartial,
} from "@/lib/site-templates/contractor/types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep<T>(base: T, override?: DeepPartial<T>): T {
  if (!override) {
    return structuredClone(base);
  }

  if (Array.isArray(base)) {
    return (override as T | undefined) ? structuredClone(override as T) : structuredClone(base);
  }

  if (!isPlainObject(base)) {
    return (override as T | undefined) ?? structuredClone(base);
  }

  const result: Record<string, unknown> = { ...base };

  for (const key of Object.keys(override)) {
    const baseValue = result[key];
    const overrideValue = (override as Record<string, unknown>)[key];

    if (overrideValue === undefined) {
      continue;
    }

    if (Array.isArray(overrideValue)) {
      result[key] = structuredClone(overrideValue);
      continue;
    }

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = mergeDeep(baseValue, overrideValue);
      continue;
    }

    result[key] = overrideValue;
  }

  return result as T;
}

const PRESET_BY_KEY = new Map<ContractorPresetKey, ContractorPreset>(
  CONTRACTOR_PRESETS.map((preset) => [preset.key, preset])
);

export function getContractorPreset(key: ContractorPresetKey) {
  return PRESET_BY_KEY.get(key);
}

export function buildContractorSiteData(
  presetKey: ContractorPresetKey,
  overrides?: DeepPartial<ContractorSiteData>
) {
  const preset = getContractorPreset(presetKey);

  if (!preset) {
    throw new Error(`Missing contractor preset "${presetKey}".`);
  }

  return mergeDeep(preset.defaults, overrides);
}
