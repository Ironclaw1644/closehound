export async function resolveRoofingArchetypeBatchSelection(input: {
  requestedBatch: string | null;
  hasRequestedBatch: boolean;
  getLatestApprovedBatch: () => Promise<string | null>;
}) {
  if (input.hasRequestedBatch) {
    return input.requestedBatch;
  }

  return input.getLatestApprovedBatch();
}
