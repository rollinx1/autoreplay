export type CheckRule = {
  id: number;
  name: string;
  description: string;
  code: string;
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

export type ScanState = "idle" | "running" | "paused" | "stopped";

export type Session = {
  id: number;
  name: string;
  status: "setup" | "results";
  requests: HttpRequest[];
  createdAt: string;
};
