"use client";

import type { Assumptions } from "@/lib/underwriting/types";
import { NumberField } from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function AssumptionsPanel({
  a,
  onChange,
}: {
  a: Assumptions;
  onChange: (patch: Partial<Assumptions>) => void;
}) {
  const f = (k: keyof Assumptions) => (v: number) => onChange({ [k]: v } as Partial<Assumptions>);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assumptions</CardTitle>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">live re-score</span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-3 gap-y-3">
        <NumberField label="Down payment" suffix="%" value={a.downPaymentPct} onChange={f("downPaymentPct")} />
        <NumberField label="Interest" suffix="%" step={0.125} value={a.interestRatePct} onChange={f("interestRatePct")} />
        <NumberField label="Loan term" suffix="yr" value={a.loanTermYears} onChange={f("loanTermYears")} />
        <NumberField label="Closing" suffix="%" step={0.5} value={a.closingCostPct} onChange={f("closingCostPct")} />
        <NumberField label="Rehab" suffix="$" step={1000} value={a.rehabCost} onChange={f("rehabCost")} />
        <NumberField
          label="Payment std"
          suffix="×"
          step={0.01}
          min={1}
          max={1.1}
          value={a.paymentStandardMultiplier}
          onChange={f("paymentStandardMultiplier")}
        />
        <NumberField label="Mgmt" suffix="%" value={a.propertyMgmtPct} onChange={f("propertyMgmtPct")} />
        <NumberField label="Vacancy" suffix="%" value={a.vacancyPct} onChange={f("vacancyPct")} />
        <NumberField label="Maintenance" suffix="%" value={a.maintenancePct} onChange={f("maintenancePct")} />
        <NumberField label="CapEx" suffix="%" value={a.capexReservePct} onChange={f("capexReservePct")} />
        <NumberField label="Tax rate" suffix="%" step={0.1} value={a.taxRatePct} onChange={f("taxRatePct")} />
        <NumberField label="Insurance" suffix="%" step={0.1} value={a.insuranceRatePct} onChange={f("insuranceRatePct")} />
        <NumberField label="Monthly HOA" suffix="$" step={10} value={a.monthlyHOA} onChange={f("monthlyHOA")} />
      </CardContent>
    </Card>
  );
}
