import type { PreviewModel } from "@/lib/preview/types";
import { HandymanPreview } from "@/components/preview/industries/HandymanPreview";
import { PressureWashingPreview } from "@/components/preview/industries/PressureWashingPreview";
import { RoofingPreview } from "@/components/preview/industries/RoofingPreview";
import { HvacPreview } from "@/components/preview/industries/HvacPreview";
import { PlumbingPreview } from "@/components/preview/industries/PlumbingPreview";
import { DentalPreview } from "@/components/preview/industries/DentalPreview";
import { MedSpaPreview } from "@/components/preview/industries/MedSpaPreview";
import { JunkRemovalPreview } from "@/components/preview/industries/JunkRemovalPreview";
import { MobileDetailingPreview } from "@/components/preview/industries/MobileDetailingPreview";
import { LandscapingPreview } from "@/components/preview/industries/LandscapingPreview";
import { PaintingPreview } from "@/components/preview/industries/PaintingPreview";
import { ElectricalPreview } from "@/components/preview/industries/ElectricalPreview";
import { AutoRepairPreview } from "@/components/preview/industries/AutoRepairPreview";
import { PestControlPreview } from "@/components/preview/industries/PestControlPreview";

export function PreviewRouter({ model }: { model: PreviewModel }) {
  switch (model.industry) {
    case "handyman":
      return <HandymanPreview model={model} />;
    case "pressure washing":
      return <PressureWashingPreview model={model} />;
    case "roofing":
      return <RoofingPreview model={model} />;
    case "HVAC":
      return <HvacPreview model={model} />;
    case "plumbing":
      return <PlumbingPreview model={model} />;
    case "dental":
      return <DentalPreview model={model} />;
    case "med spa":
      return <MedSpaPreview model={model} />;
    case "junk removal":
      return <JunkRemovalPreview model={model} />;
    case "mobile detailing":
      return <MobileDetailingPreview model={model} />;
    case "landscaping":
      return <LandscapingPreview model={model} />;
    case "painting":
      return <PaintingPreview model={model} />;
    case "electrical":
      return <ElectricalPreview model={model} />;
    case "auto repair":
      return <AutoRepairPreview model={model} />;
    case "pest control":
      return <PestControlPreview model={model} />;
  }
}
