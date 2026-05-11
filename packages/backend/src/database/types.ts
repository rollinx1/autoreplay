export type InsertSessionInput = {
  name: string;
  status?: "setup" | "results";
};

export type UpdateSessionInput = {
  name?: string;
  status?: "setup" | "results";
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

export type Setting = {
  id: number;
  type: string;
  identifier: string;
  data: string;
};

export type UpsertSettingInput = {
  type: string;
  identifier: string;
  data: string;
};
