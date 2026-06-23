import { type Caido } from "@caido/sdk-frontend";
import { type API } from "backend";

import type { ScanResult } from "./types/index";

type BackendEvents = {
  "scan-result-created": (sessionId: number, result: ScanResult) => void;
  "scan-complete": (sessionId: number) => void;
  "project-changed": () => void;
};

export type FrontendSDK = Caido<API, BackendEvents>;

// Re-export domain models
export * from "./types/index";
