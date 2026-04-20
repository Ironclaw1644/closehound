import "./register-ts-path-loader.mjs";

const [{ createRoofingGenerationBatch }, { buildTemplateImageStoragePath }] =
  await Promise.all([
    import("../src/lib/template-system/images/generate-roofing.ts"),
    import("../src/lib/template-system/images/storage.ts"),
  ]);

const batch = createRoofingGenerationBatch({
  familyKey: "blue-collar-service",
  templateKey: "roofing-v1",
  templateVersion: "1.0.0",
  createdBy: "internal-command",
});

console.log(
  JSON.stringify(
    {
      ...batch,
      items: batch.items.map((item) => ({
        ...item,
        storagePath: buildTemplateImageStoragePath({
          templateKey: item.templateKey,
          generationBatchId: item.generationBatchId,
          slot: item.slot,
          candidateIndex: item.candidateIndex,
        }),
      })),
    },
    null,
    2
  )
);
