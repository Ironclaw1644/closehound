export function buildTemplateImageStoragePath(input: {
  templateKey: string;
  slot: string;
  generationBatchId: string;
  candidateIndex: number;
}) {
  return `template-images/${input.templateKey}/${input.generationBatchId}/${input.slot}-${input.candidateIndex}.png`;
}
