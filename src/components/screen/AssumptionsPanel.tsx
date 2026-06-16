"use client";

import type { Assumptions } from "@/lib/underwriting/types";
import { NumberField } from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDictionary, type Locale } from "@/lib/i18n";

export function AssumptionsPanel({
  a,
  onChange,
  locale = "en",
}: {
  a: Assumptions;
  onChange: (patch: Partial<Assumptions>) => void;
  locale?: Locale;
}) {
  const t = getDictionary(locale).app.assumptions;
  const f = (k: keyof Assumptions) => (v: number) => onChange({ [k]: v } as Partial<Assumptions>);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{t.liveRescore}</span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-3 gap-y-3">
        <NumberField label={t.downPayment} suffix="%" value={a.downPaymentPct} onChange={f("downPaymentPct")} />
        <NumberField label={t.interest} suffix="%" step={0.125} value={a.interestRatePct} onChange={f("interestRatePct")} />
        <NumberField label={t.loanTerm} suffix="yr" min={1} value={a.loanTermYears} onChange={f("loanTermYears")} />
        <NumberField label={t.closing} suffix="%" step={0.5} value={a.closingCostPct} onChange={f("closingCostPct")} />
        <NumberField label={t.rehab} suffix="$" step={1000} value={a.rehabCost} onChange={f("rehabCost")} />
        <NumberField label={t.paymentStd} suffix="×" step={0.01} min={1} max={1.1} value={a.paymentStandardMultiplier} onChange={f("paymentStandardMultiplier")} />
        <NumberField label={t.mgmt} suffix="%" value={a.propertyMgmtPct} onChange={f("propertyMgmtPct")} />
        <NumberField label={t.vacancy} suffix="%" value={a.vacancyPct} onChange={f("vacancyPct")} />
        <NumberField label={t.maintenance} suffix="%" value={a.maintenancePct} onChange={f("maintenancePct")} />
        <NumberField label={t.capex} suffix="%" value={a.capexReservePct} onChange={f("capexReservePct")} />
        <NumberField label={t.taxRate} suffix="%" step={0.1} value={a.taxRatePct} onChange={f("taxRatePct")} />
        <NumberField label={t.insurance} suffix="%" step={0.1} value={a.insuranceRatePct} onChange={f("insuranceRatePct")} />
        <NumberField label={t.monthlyHOA} suffix="$" step={10} value={a.monthlyHOA} onChange={f("monthlyHOA")} />
      </CardContent>
    </Card>
  );
}
