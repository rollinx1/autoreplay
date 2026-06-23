export type CheckRule = {
  id: number;
  name: string;
  description: string;
  code: string;
};

export type ScanProfile = {
  id: number;
  name: string;
  checkIds: number[];
  threads: number;
  delayMs: number;
  timeoutSec: number;
  createdAt: string;
};

export type HttpRequest = {
  id: string;
  method: string;
  url: string;
  path: string;
  query: string;
  host: string;
  capturedAt: string;
};

export type ScanResult = {
  id: number;
  originalRequestId: string;
  checkId?: number;
  checkName?: string;
  method: string;
  host: string;
  path: string;
  query: string;
  modifiedRequestId?: string;
  statusCode?: number;
  size: number;
  duration: number;
  timestamp: string;
};

export type Session = {
  id: number;
  name: string;
  status: "setup" | "results";
  setupFilter: string;
  resultsFilter: string;
  scanTag: string;
  requests: HttpRequest[];
  createdAt: string;
};

export type Resource = {
  id: number;
  type: string;
  identifier: string;
  data: string;
};

export type Result<T> =
  | { kind: "Ok"; value: T }
  | { kind: "Error"; error: string };

export enum BackendEvent {
  ScanResultCreated = "scan-result-created",
  ScanComplete = "scan-complete",
  ProjectChanged = "project-changed",
}

export type PluginEvents = {
  [BackendEvent.ScanResultCreated]: (
    sessionId: number,
    result: ScanResult,
  ) => void;
  [BackendEvent.ScanComplete]: (sessionId: number) => void;
  [BackendEvent.ProjectChanged]: () => void;
};
