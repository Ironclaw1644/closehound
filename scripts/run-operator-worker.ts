import { startOperatorWorker } from "@/server/operator/worker";

const workerName = process.env.OPERATOR_WORKER_NAME?.trim() || "closehound-mac-mini";
const pollIntervalMs = Number(process.env.OPERATOR_POLL_INTERVAL_MS ?? "5000");

await startOperatorWorker({
  workerName,
  pollIntervalMs: Number.isFinite(pollIntervalMs) ? pollIntervalMs : 5000,
});
