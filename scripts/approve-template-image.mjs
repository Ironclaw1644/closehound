import "./register-ts-path-loader.mjs";

const candidateId = process.argv[2];

if (!candidateId) {
  console.error("Usage: node scripts/approve-template-image.mjs <candidate-id> [approved-by]");
  process.exit(1);
}

const approvedBy = process.argv[3] || process.env.USER || "internal-command";

const [{ approveTemplateImageCandidate }] = await Promise.all([
  import("../src/lib/template-system/images/repository.ts"),
]);

const approved = await approveTemplateImageCandidate({
  candidateId,
  approvedBy,
});

console.log(
  JSON.stringify(
    {
      id: approved.id,
      generationBatchId: approved.generationBatchId,
      slot: approved.slot,
      status: approved.status,
      storagePath: approved.storagePath,
      assetUrl: approved.assetUrl ?? null,
      approvalUpdatedAt: approved.approvalUpdatedAt ?? null,
      approvalUpdatedBy: approved.approvalUpdatedBy ?? null,
    },
    null,
    2
  )
);
