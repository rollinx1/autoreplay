import type { SDK } from "caido:plugin";
import type { Database } from "sqlite";

import type { CheckRule, Session } from "../types";

import { getProjectId } from "./helpers";

async function getDb(sdk: SDK): Promise<Database> {
  return await sdk.meta.db();
}

type SessionRow = {
  id: number;
  name: string;
  status: "setup" | "results";
  created_at: number;
  updated_at: number;
};

function mapRowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    requests: [],
    createdAt: new Date(row.created_at * 1000).toISOString(),
  };
}

export async function getSessions(sdk: SDK): Promise<Session[]> {
  const projectId = await getProjectId(sdk);
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, status, created_at, updated_at FROM sessions WHERE project_id = ? ORDER BY created_at ASC",
  );
  const rows = await stmt.all<SessionRow>(projectId);
  return rows.map(mapRowToSession);
}

export async function getSession(
  sdk: SDK,
  id: number,
): Promise<Session | undefined> {
  const projectId = await getProjectId(sdk);
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, status, created_at, updated_at FROM sessions WHERE id = ? AND project_id = ?",
  );
  const row = await stmt.get<SessionRow>(id, projectId);
  if (!row) return undefined;
  return mapRowToSession(row);
}

type CheckRow = {
  id: number;
  name: string;
  description: string;
  code: string;
  created_at: number;
  updated_at: number;
};

function mapRowToCheckRule(row: CheckRow): CheckRule {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    code: row.code,
  };
}

export async function getChecks(sdk: SDK): Promise<CheckRule[]> {
  const projectId = await getProjectId(sdk);
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, description, code, created_at, updated_at FROM checks WHERE project_id = ? ORDER BY created_at ASC",
  );
  const rows = await stmt.all<CheckRow>(projectId);
  return rows.map(mapRowToCheckRule);
}

export async function getCheck(
  sdk: SDK,
  id: number,
): Promise<CheckRule | undefined> {
  const projectId = await getProjectId(sdk);
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, description, code, created_at, updated_at FROM checks WHERE id = ? AND project_id = ?",
  );
  const row = await stmt.get<CheckRow>(id, projectId);
  if (!row) return undefined;
  return mapRowToCheckRule(row);
}

type ScanResultRow = {
  id: number;
  session_id: number;
  original_request_id: string;
  check_id: number | undefined;
  check_name: string | undefined;
  method: string;
  host: string;
  path: string;
  query: string;
  status: string;
  status_code: number | undefined;
  size: number | undefined;
  modified_request_id: string | undefined;
  duration: number;
  created_at: number;
};

export async function getScanResults(
  sdk: SDK,
  sessionId: number,
): Promise<ScanResultRow[]> {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, session_id, original_request_id, check_id, check_name, method, host, path, query, status, status_code, size, modified_request_id, duration, created_at FROM scan_results WHERE session_id = ? ORDER BY created_at ASC",
  );
  return await stmt.all<ScanResultRow>(sessionId);
}

type SettingRow = {
  id: number;
  type: string;
  identifier: string;
  data: string;
};

export async function getSettings(
  sdk: SDK,
  type?: string,
): Promise<SettingRow[]> {
  const projectId = await getProjectId(sdk);
  const db = await getDb(sdk);
  if (type !== undefined) {
    const stmt = await db.prepare(
      "SELECT id, type, identifier, data FROM settings WHERE type = ? AND project_id = ?",
    );
    return await stmt.all<SettingRow>(type, projectId);
  }
  const stmt = await db.prepare(
    "SELECT id, type, identifier, data FROM settings WHERE project_id = ?",
  );
  return await stmt.all<SettingRow>(projectId);
}

export async function getSetting(
  sdk: SDK,
  type: string,
  identifier: string,
): Promise<SettingRow | undefined> {
  const projectId = await getProjectId(sdk);
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, type, identifier, data FROM settings WHERE type = ? AND identifier = ? AND project_id = ?",
  );
  return await stmt.get<SettingRow>(type, identifier, projectId);
}
