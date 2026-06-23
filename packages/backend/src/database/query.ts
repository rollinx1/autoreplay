import type { SDK } from "caido:plugin";
import type { Database } from "sqlite";

import type { CheckRule, ScanProfile, Session } from "../types";

import { getProjectId } from "./helpers";

async function getDb(sdk: SDK): Promise<Database> {
  return await sdk.meta.db();
}

type SessionRow = {
  id: number;
  name: string;
  status: "setup" | "results";
  setup_filter: string;
  results_filter: string;
  scan_tag: string;
  created_at: number;
  updated_at: number;
};

function mapRowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    setupFilter: row.setup_filter,
    resultsFilter: row.results_filter,
    scanTag: row.scan_tag,
    requests: [],
    createdAt: new Date(row.created_at * 1000).toISOString(),
  };
}

export async function getSessions(sdk: SDK): Promise<Session[]> {
  const projectId = await getProjectId(sdk);
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, status, setup_filter, results_filter, scan_tag, created_at, updated_at FROM sessions WHERE project_id = ? ORDER BY created_at ASC",
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
    "SELECT id, name, status, setup_filter, results_filter, scan_tag, created_at, updated_at FROM sessions WHERE id = ? AND project_id = ?",
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
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, description, code, created_at, updated_at FROM checks ORDER BY created_at ASC",
  );
  const rows = await stmt.all<CheckRow>();
  return rows.map(mapRowToCheckRule);
}

export async function getCheck(
  sdk: SDK,
  id: number,
): Promise<CheckRule | undefined> {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, description, code, created_at, updated_at FROM checks WHERE id = ?",
  );
  const row = await stmt.get<CheckRow>(id);
  if (!row) return undefined;
  return mapRowToCheckRule(row);
}

type ScanProfileRow = {
  id: number;
  name: string;
  check_ids: string;
  threads: number;
  delay_ms: number;
  timeout_sec: number;
  created_at: number;
  updated_at: number;
};

function parseJson(value: unknown): unknown {
  if (typeof value !== "string" || value.trim() === "") return undefined;

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function mapRowToScanProfile(row: ScanProfileRow): ScanProfile {
  const parsedCheckIds = parseJson(row.check_ids);
  const checkIds = Array.isArray(parsedCheckIds)
    ? parsedCheckIds.filter(
        (value): value is number =>
          typeof value === "number" && Number.isInteger(value),
      )
    : [];

  return {
    id: row.id,
    name: row.name,
    checkIds,
    threads: row.threads,
    delayMs: row.delay_ms,
    timeoutSec: row.timeout_sec,
    createdAt: new Date(row.created_at * 1000).toISOString(),
  };
}

export async function getScanProfiles(sdk: SDK): Promise<ScanProfile[]> {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, check_ids, threads, delay_ms, timeout_sec, created_at, updated_at FROM scan_profiles ORDER BY created_at ASC",
  );
  const rows = await stmt.all<ScanProfileRow>();
  return rows.map(mapRowToScanProfile);
}

export async function getScanProfile(
  sdk: SDK,
  id: number,
): Promise<ScanProfile | undefined> {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, name, check_ids, threads, delay_ms, timeout_sec, created_at, updated_at FROM scan_profiles WHERE id = ?",
  );
  const row = await stmt.get<ScanProfileRow>(id);
  return row === undefined ? undefined : mapRowToScanProfile(row);
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

type ResourceRow = {
  id: number;
  type: string;
  identifier: string;
  data: string;
};

export async function getResources(
  sdk: SDK,
  type?: string,
): Promise<ResourceRow[]> {
  const db = await getDb(sdk);
  if (type !== undefined) {
    const stmt = await db.prepare(
      "SELECT id, type, identifier, data FROM resources WHERE type = ?",
    );
    return await stmt.all<ResourceRow>(type);
  }
  const stmt = await db.prepare(
    "SELECT id, type, identifier, data FROM resources",
  );
  return await stmt.all<ResourceRow>();
}

export async function getResource(
  sdk: SDK,
  type: string,
  identifier: string,
): Promise<ResourceRow | undefined> {
  const db = await getDb(sdk);
  const stmt = await db.prepare(
    "SELECT id, type, identifier, data FROM resources WHERE type = ? AND identifier = ?",
  );
  return await stmt.get<ResourceRow>(type, identifier);
}
