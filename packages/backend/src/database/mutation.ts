import type { SDK } from "caido:plugin";
import type { Database, Parameter } from "sqlite";

import { BackendEvent, type PluginEvents, type ScanResult } from "../types";

import { getProjectId } from "./helpers";
import type {
  InsertCheckInput,
  InsertScanResultInput,
  InsertSessionInput,
  UpdateCheckInput,
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
    "INSERT INTO sessions (project_id, name, status) VALUES (?, ?, ?)",
  );
  const result = await stmt.run(projectId, input.name, input.status ?? "setup");
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
  const projectId = await getProjectId(sdk);
  if (projectId === null || projectId === undefined) {
    throw new Error("No active project - cannot create check");
  }
  if (!input.name || input.name.trim() === "") {
    throw new Error("Check name is required");
  }
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "INSERT INTO checks (project_id, name, description, code) VALUES (?, ?, ?, ?)",
  );
  const result = await stmt.run(
    projectId,
    input.name,
    input.description,
    input.code,
  );
  return Number(result.lastInsertRowid ?? 0);
}

export async function updateCheck(
  sdk: SDK,
  id: number,
  input: UpdateCheckInput,
): Promise<void> {
  const projectId = await getProjectId(sdk);
  if (projectId === null || projectId === undefined) {
    throw new Error("No active project - cannot update check");
  }
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

  params.push(id, projectId);
  const stmt = await db.prepare(
    `UPDATE checks SET ${updates.join(", ")}, updated_at = strftime('%s', 'now') WHERE id = ? AND project_id = ?`,
  );
  await stmt.run(...(params as Parameter[]));
}

export async function deleteCheck(sdk: SDK, id: number): Promise<void> {
  const projectId = await getProjectId(sdk);
  if (projectId === null || projectId === undefined) {
    throw new Error("No active project - cannot delete check");
  }
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "DELETE FROM checks WHERE id = ? AND project_id = ?",
  );
  await stmt.run(id, projectId);
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
  sdk.api.send(BackendEvent.ScanResultCreated, {
    sessionId: input.sessionId,
    result: scanResult,
  });
  return scanResult;
}

export async function upsertSetting(
  sdk: SDK,
  type: string,
  identifier: string,
  data: string,
): Promise<void> {
  const projectId = await getProjectId(sdk);
  if (projectId === null || projectId === undefined) {
    throw new Error("No active project - cannot save setting");
  }
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "INSERT INTO settings (type, identifier, project_id, data) VALUES (?, ?, ?, ?) ON CONFLICT(type, identifier, project_id) DO UPDATE SET data = excluded.data, updated_at = strftime('%s', 'now')",
  );
  await stmt.run(type, identifier, projectId, data);
}

export async function deleteSetting(
  sdk: SDK,
  type: string,
  identifier: string,
): Promise<void> {
  const projectId = await getProjectId(sdk);
  if (projectId === null || projectId === undefined) {
    throw new Error("No active project - cannot delete setting");
  }
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "DELETE FROM settings WHERE type = ? AND identifier = ? AND project_id = ?",
  );
  await stmt.run(type, identifier, projectId);
}
