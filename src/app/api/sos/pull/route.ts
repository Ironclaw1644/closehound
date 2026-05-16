import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdirSync, openSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const VALID_SOURCES = new Set(["fl_sunbiz", "ny_dos"]);

/**
 * POST /api/sos/pull
 *
 * Runs the Python `lead_ingestion` orchestrator out-of-band: spawns the
 * orchestrator with `--source <source> --days <days> --skip-gmb`, then chains
 * the contact backfill, then chains promote_to_leads. The route returns
 * immediately with the log path so the dashboard doesn't hang on the
 * 1-5-minute pipeline run. New leads appear in the table as they're upserted
 * (the dashboard polls /api/leads every 4s).
 *
 * Replaces the old `/api/leadhound/run` flow which was tied to the Google
 * Places "Find Place" search. SOS filings are now the only lead source.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { source?: string; days?: number };
  const source = body.source?.trim().toLowerCase();
  const days = typeof body.days === "number" ? body.days : 7;

  if (!source || !VALID_SOURCES.has(source)) {
    return NextResponse.json(
      { error: "source must be one of: fl_sunbiz, ny_dos" },
      { status: 400 }
    );
  }
  if (days < 1 || days > 60) {
    return NextResponse.json(
      { error: "days must be between 1 and 60" },
      { status: 400 }
    );
  }

  // Logs go to ~/closehound-logs/sos-pull-<ts>.log so the operator can tail
  // them. The directory is created if missing.
  const logsDir = path.join(os.homedir(), "closehound-logs");
  mkdirSync(logsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const logPath = path.join(logsDir, `sos-pull-${source}-${ts}.log`);
  const logFd = openSync(logPath, "a");

  // Run in the lead_ingestion worktree dir. `uv run` discovers the venv.
  const cwd = path.join(process.cwd(), "lead_ingestion");

  // Chain orchestrator → backfill_contacts → promote_to_leads in a single
  // shell so we can detach as one process tree. The chain only proceeds on
  // success of each step. `--skip-gmb` keeps it fast (~5 min for 7d window).
  const cmd =
    `uv run python -m lead_ingestion.orchestrator --source ${source} --days ${days} --skip-gmb && ` +
    `uv run python scripts/backfill_contacts.py --limit 2000 && ` +
    `uv run python scripts/promote_to_leads.py`;

  const child = spawn("bash", ["-lc", cmd], {
    cwd,
    detached: true,
    stdio: ["ignore", logFd, logFd],
  });
  child.unref();

  return NextResponse.json({
    started: true,
    pid: child.pid,
    source,
    days,
    logPath,
    hint:
      "Pipeline runs in background. New leads stream into the dashboard as they upsert " +
      "(table polls every 4s). Tail: `tail -f " + logPath + "`",
  });
}
