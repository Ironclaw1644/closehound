import "./register-ts-path-loader.mjs";

const [{ runDentalGenerationBatch }] = await Promise.all([
  import("../src/lib/template-system/images/generate-dental.ts"),
]);

const result = await runDentalGenerationBatch({
  familyKey: "clinical-care",
  templateKey: "dental-v1",
  templateVersion: "1.0.0",
  createdBy: process.env.USER || "internal-command",
});

console.log(
  JSON.stringify(
    {
      generationBatchId: result.generationBatchId,
      createdAt: result.createdAt,
      createdBy: result.createdBy,
      candidates: result.records.map((record) => ({
        id: record.id,
        slot: record.slot,
        candidateIndex: record.candidateIndex,
        status: record.status,
        storagePath: record.storagePath,
        assetUrl: record.assetUrl ?? null,
      })),
    },
    null,
    2
  )
);
