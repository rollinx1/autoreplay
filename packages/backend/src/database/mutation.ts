import type { SDK } from "caido:plugin";
import type { Database, Parameter } from "sqlite";

import { BackendEvent, type PluginEvents, type ScanResult } from "../types";

import { getProjectId } from "./helpers";
import type {
  InsertCheckInput,
  InsertScanProfileInput,
  InsertScanResultInput,
  InsertSessionInput,
  UpdateCheckInput,
  UpdateScanProfileInput,
  UpdateSessionInput,
} from "./types";

async function getDb(sdk: SDK): Promise<Database> {
  return await sdk.meta.db();
}

export async function insertSession(
  sdk: SDK,
  input: InsertSessionInput,
): Promise<number> {
  const projectId = await getProjectId(sdk);
  if (projectId === null || projectId === undefined) {
    throw new Error("No active project - cannot create session");
  }
  if (!input.name || input.name.trim() === "") {
    throw new Error("Session name is required");
  }
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "INSERT INTO sessions (project_id, name, status, setup_filter, results_filter, scan_tag) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const result = await stmt.run(
    projectId,
    input.name,
    input.status ?? "setup",
    input.setupFilter ?? "",
    input.resultsFilter ?? "",
    input.scanTag ?? "",
  );
  return Number(result.lastInsertRowid ?? 0);
}

export async function updateSession(
  sdk: SDK,
  id: number,
  input: UpdateSessionInput,
): Promise<void> {
  const projectId = await getProjectId(sdk);
  if (projectId === null || projectId === undefined) {
    throw new Error("No active project - cannot update session");
  }
  const db = await getDb(sdk);
  const updates: string[] = [];
  const params: unknown[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    params.push(input.name);
  }
  if (input.status !== undefined) {
    updates.push("status = ?");
    params.push(input.status);
  }
  if (input.setupFilter !== undefined) {
    updates.push("setup_filter = ?");
    params.push(input.setupFilter);
  }
  if (input.resultsFilter !== undefined) {
    updates.push("results_filter = ?");
    params.push(input.resultsFilter);
  }
  if (input.scanTag !== undefined) {
    updates.push("scan_tag = ?");
    params.push(input.scanTag);
  }

  if (updates.length === 0) return;

  params.push(id, projectId);
  const stmt = await db.prepare(
    `UPDATE sessions SET ${updates.join(", ")}, updated_at = strftime('%s', 'now') WHERE id = ? AND project_id = ?`,
  );
  await stmt.run(...(params as Parameter[]));
}

export async function deleteSession(sdk: SDK, id: number): Promise<void> {
  const projectId = await getProjectId(sdk);
  if (projectId === null || projectId === undefined) {
    throw new Error("No active project - cannot delete session");
  }
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "DELETE FROM sessions WHERE id = ? AND project_id = ?",
  );
  await stmt.run(id, projectId);
}

export async function insertCheck(
  sdk: SDK,
  input: InsertCheckInput,
): Promise<number> {
  if (!input.name || input.name.trim() === "") {
    throw new Error("Check name is required");
  }
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "INSERT INTO checks (name, description, code) VALUES (?, ?, ?)",
  );
  const result = await stmt.run(input.name, input.description, input.code);
  return Number(result.lastInsertRowid ?? 0);
}

export async function updateCheck(
  sdk: SDK,
  id: number,
  input: UpdateCheckInput,
): Promise<void> {
  const db = await getDb(sdk);
  const updates: string[] = [];
  const params: unknown[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    params.push(input.name);
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    params.push(input.description);
  }
  if (input.code !== undefined) {
    updates.push("code = ?");
    params.push(input.code);
  }

  if (updates.length === 0) return;

  params.push(id);
  const stmt = await db.prepare(
    `UPDATE checks SET ${updates.join(", ")}, updated_at = strftime('%s', 'now') WHERE id = ?`,
  );
  await stmt.run(...(params as Parameter[]));
}

export async function deleteCheck(sdk: SDK, id: number): Promise<void> {
  const db = await getDb(sdk);
  const stmt = await db.prepare("DELETE FROM checks WHERE id = ?");
  await stmt.run(id);
}

export async function insertScanProfile(
  sdk: SDK,
  input: InsertScanProfileInput,
): Promise<number> {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "INSERT INTO scan_profiles (name, check_ids, threads, delay_ms, timeout_sec) VALUES (?, ?, ?, ?, ?)",
  );
  const result = await stmt.run(
    input.name,
    JSON.stringify(input.checkIds),
    input.threads,
    input.delayMs,
    input.timeoutSec,
  );
  return Number(result.lastInsertRowid ?? 0);
}

export async function updateScanProfile(
  sdk: SDK,
  id: number,
  input: UpdateScanProfileInput,
): Promise<void> {
  const db = await getDb(sdk);
  const updates: string[] = [];
  const params: unknown[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    params.push(input.name);
  }
  if (input.checkIds !== undefined) {
    updates.push("check_ids = ?");
    params.push(JSON.stringify(input.checkIds));
  }
  if (input.threads !== undefined) {
    updates.push("threads = ?");
    params.push(input.threads);
  }
  if (input.delayMs !== undefined) {
    updates.push("delay_ms = ?");
    params.push(input.delayMs);
  }
  if (input.timeoutSec !== undefined) {
    updates.push("timeout_sec = ?");
    params.push(input.timeoutSec);
  }
  if (updates.length === 0) return;

  params.push(id);
  const stmt = await db.prepare(
    `UPDATE scan_profiles SET ${updates.join(", ")}, updated_at = strftime('%s', 'now') WHERE id = ?`,
  );
  await stmt.run(...(params as Parameter[]));
}

export async function deleteScanProfile(sdk: SDK, id: number): Promise<void> {
  const db = await getDb(sdk);
  const stmt = await db.prepare("DELETE FROM scan_profiles WHERE id = ?");
  await stmt.run(id);
}

export async function insertScanResult(
  sdk: SDK<Record<string, never>, PluginEvents>,
  input: InsertScanResultInput,
): Promise<ScanResult> {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "INSERT INTO scan_results (session_id, original_request_id, check_id, check_name, method, host, path, query, status, status_code, size, modified_request_id, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const result = await stmt.run(
    input.sessionId,
    input.originalRequestId,
    input.checkId ?? null,
    input.checkName ?? null,
    input.method,
    input.host,
    input.path,
    input.query,
    input.status,
    input.statusCode ?? null,
    input.size ?? null,
    input.modifiedRequestId ?? null,
    input.duration,
  );
  const id = Number(result.lastInsertRowid ?? 0);
  const scanResult: ScanResult = {
    id,
    originalRequestId: input.originalRequestId,
    checkId: input.checkId,
    checkName: input.checkName,
    method: input.method,
    host: input.host,
    path: input.path,
    query: input.query,
    modifiedRequestId: input.modifiedRequestId,
    statusCode: input.statusCode,
    size: input.size ?? 0,
    duration: input.duration,
    timestamp: new Date().toISOString(),
  };
  sdk.api.send(BackendEvent.ScanResultCreated, input.sessionId, scanResult);
  return scanResult;
}

export async function upsertResource(
  sdk: SDK,
  type: string,
  identifier: string,
  data: string,
): Promise<void> {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "INSERT INTO resources (type, identifier, data) VALUES (?, ?, ?) ON CONFLICT(type, identifier) DO UPDATE SET data = excluded.data, updated_at = strftime('%s', 'now')",
  );
  await stmt.run(type, identifier, data);
}

export async function deleteResource(
  sdk: SDK,
  type: string,
  identifier: string,
): Promise<void> {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "DELETE FROM resources WHERE type = ? AND identifier = ?",
  );
  await stmt.run(type, identifier);
}
