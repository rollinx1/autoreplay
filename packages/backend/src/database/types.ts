export type InsertSessionInput = {
  name: string;
  status?: "setup" | "results";
  setupFilter?: string;
  resultsFilter?: string;
  scanTag?: string;
};

export type UpdateSessionInput = {
  name?: string;
  status?: "setup" | "results";
  setupFilter?: string;
  resultsFilter?: string;
  scanTag?: string;
};

export type InsertCheckInput = {
  name: string;
  description: string;
  code: string;
};

export type UpdateCheckInput = {
  name?: string;
  description?: string;
  code?: string;
};

export type InsertScanProfileInput = {
  name: string;
  checkIds: number[];
  threads: number;
  delayMs: number;
  timeoutSec: number;
};

export type UpdateScanProfileInput = {
  name?: string;
  checkIds?: number[];
  threads?: number;
  delayMs?: number;
  timeoutSec?: number;
};

export type InsertScanResultInput = {
  sessionId: number;
  originalRequestId: string;
  checkId?: number;
  checkName?: string;
  method: string;
  host: string;
  path: string;
  query: string;
  status: "pending" | "success" | "error";
  statusCode?: number;
  size?: number;
  modifiedRequestId?: string;
  duration: number;
};

export type Resource = {
  id: number;
  type: string;
  identifier: string;
  data: string;
};

export type UpsertResourceInput = {
  type: string;
  identifier: string;
  data: string;
};
