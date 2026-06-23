import type { SDK } from "caido:plugin";

export async function initializeDatabase(sdk: SDK): Promise<void> {
  const db = await sdk.meta.db();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'setup',
      setup_filter TEXT NOT NULL DEFAULT '',
      results_filter TEXT NOT NULL DEFAULT '',
      scan_tag TEXT NOT NULL DEFAULT '',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_project
    ON sessions(project_id)
  `);

  try {
    await db.exec(
      `ALTER TABLE sessions ADD COLUMN setup_filter TEXT NOT NULL DEFAULT ''`,
    );
  } catch {
    // Column already exists in older databases
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      code TEXT NOT NULL DEFAULT '',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS scan_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      check_ids TEXT NOT NULL DEFAULT '[]',
      threads INTEGER NOT NULL DEFAULT 5,
      delay_ms INTEGER NOT NULL DEFAULT 0,
      timeout_sec INTEGER NOT NULL DEFAULT 30,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS scan_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      original_request_id TEXT NOT NULL,
      check_id INTEGER,
      check_name TEXT,
      method TEXT NOT NULL DEFAULT '',
      host TEXT NOT NULL DEFAULT '',
      path TEXT NOT NULL DEFAULT '',
      query TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      status_code INTEGER,
      size INTEGER,
      modified_request_id TEXT,
      duration INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_scan_results_session
    ON scan_results(session_id)
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      identifier TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(type, identifier)
    )
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_resources_type
    ON resources(type)
  `);

  sdk.console.log("AutoReplay database initialized");
}
