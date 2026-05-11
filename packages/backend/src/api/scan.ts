import type { SDK } from "caido:plugin";

import { getActivePool, runScan } from "../core/scanner/runner";
import { getScanResults as getScanResultsDb } from "../database/query";
import type { CheckRule, PluginEvents, Result, ScanResult } from "../types";

export const executeScan = (
  sdk: SDK<Record<string, never>, PluginEvents>,
  sessionId: number,
  requestIds: string[],
  checks: CheckRule[],
  options: { threads: number; delayMs: number; timeoutSec: number },
): Result<void> => {
  if (requestIds.length === 0) {
    return { kind: "Error", error: "No requests to scan" };
  }
  if (checks.length === 0) {
    return { kind: "Error", error: "No checks selected" };
  }
  if (getActivePool(sessionId) !== undefined) {
    return {
      kind: "Error",
      error: "A scan is already running for this session",
    };
  }

  void runScan(
    sdk,
    sessionId,
    requestIds,
    checks,
    options.threads,
    options.delayMs,
    options.timeoutSec,
  );
  return { kind: "Ok", value: undefined };
};

export const pauseScan = (_sdk: SDK, sessionId: number): Result<void> => {
  const pool = getActivePool(sessionId);
  if (pool === undefined) {
    return { kind: "Error", error: "No active scan for this session" };
  }
  pool.pause();
  return { kind: "Ok", value: undefined };
};

export const resumeScan = (_sdk: SDK, sessionId: number): Result<void> => {
  const pool = getActivePool(sessionId);
  if (pool === undefined) {
    return { kind: "Error", error: "No active scan for this session" };
  }
  pool.resume();
  return { kind: "Ok", value: undefined };
};

export const stopScan = (_sdk: SDK, sessionId: number): Result<void> => {
  const pool = getActivePool(sessionId);
  if (pool === undefined) {
    return { kind: "Error", error: "No active scan for this session" };
  }
  pool.stop();
  return { kind: "Ok", value: undefined };
};

export const getScanResults = async (
  sdk: SDK,
  sessionId: number,
): Promise<Result<ScanResult[]>> => {
  try {
    const rows = await getScanResultsDb(sdk, sessionId);
    const results: ScanResult[] = rows.map((row) => ({
      id: row.id,
      originalRequestId: row.original_request_id,
      checkId: row.check_id ?? undefined,
      checkName: row.check_name ?? undefined,
      method: row.method,
      host: row.host,
      path: row.path,
      query: row.query,
      modifiedRequestId: row.modified_request_id ?? undefined,
      statusCode: row.status_code ?? undefined,
      size: row.size ?? 0,
      duration: row.duration,
      timestamp: new Date(row.created_at * 1000).toISOString(),
    }));
    return { kind: "Ok", value: results };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};
