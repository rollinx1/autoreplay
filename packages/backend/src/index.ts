import type { DefineAPI, SDK } from "caido:plugin";

import { addCheck, deleteCheck, getChecks, updateCheck } from "./api/checks";
import { getRequestResponse, getSetupRequests } from "./api/requests";
import {
  executeScan,
  getScanResults,
  pauseScan,
  resumeScan,
  stopScan,
} from "./api/scan";
import {
  clearSessions,
  createSession,
  deleteSession,
  getSessions,
  updateSession,
} from "./api/session";
import {
  deleteCallbackConfig,
  deleteConstant,
  deleteDiscordWebhook,
  deletePayloadFile,
  deletePayloadList,
  getCallbackConfigs,
  getConstants,
  getDiscordWebhooks,
  getPayloadFiles,
  getPayloadLists,
  saveCallbackConfig,
  saveConstant,
  saveDiscordWebhook,
  savePayloadFile,
  savePayloadList,
} from "./api/settings";
import { seedChecks } from "./core/checks";
import { initializeDatabase } from "./database";
import { BackendEvent } from "./types";
import type { PluginEvents } from "./types";

export type API = DefineAPI<{
  createSession: typeof createSession;
  getSetupRequests: typeof getSetupRequests;
  getRequestResponse: typeof getRequestResponse;
  getSessions: typeof getSessions;
  deleteSession: typeof deleteSession;
  clearSessions: typeof clearSessions;
  updateSession: typeof updateSession;
  addCheck: typeof addCheck;
  getChecks: typeof getChecks;
  updateCheck: typeof updateCheck;
  deleteCheck: typeof deleteCheck;
  executeScan: typeof executeScan;
  pauseScan: typeof pauseScan;
  resumeScan: typeof resumeScan;
  stopScan: typeof stopScan;
  getScanResults: typeof getScanResults;
  getDiscordWebhooks: typeof getDiscordWebhooks;
  saveDiscordWebhook: typeof saveDiscordWebhook;
  deleteDiscordWebhook: typeof deleteDiscordWebhook;
  getCallbackConfigs: typeof getCallbackConfigs;
  saveCallbackConfig: typeof saveCallbackConfig;
  deleteCallbackConfig: typeof deleteCallbackConfig;
  getPayloadFiles: typeof getPayloadFiles;
  savePayloadFile: typeof savePayloadFile;
  deletePayloadFile: typeof deletePayloadFile;
  getPayloadLists: typeof getPayloadLists;
  savePayloadList: typeof savePayloadList;
  deletePayloadList: typeof deletePayloadList;
  getConstants: typeof getConstants;
  saveConstant: typeof saveConstant;
  deleteConstant: typeof deleteConstant;
}>;

export async function init(sdk: SDK<API, PluginEvents>) {
  await initializeDatabase(sdk);
  await seedChecks(sdk);

  sdk.api.register("createSession", createSession);
  sdk.api.register("getSetupRequests", getSetupRequests);
  sdk.api.register("getRequestResponse", getRequestResponse);
  sdk.api.register("getSessions", getSessions);
  sdk.api.register("deleteSession", deleteSession);
  sdk.api.register("clearSessions", clearSessions);
  sdk.api.register("updateSession", updateSession);
  sdk.api.register("addCheck", addCheck);
  sdk.api.register("getChecks", getChecks);
  sdk.api.register("updateCheck", updateCheck);
  sdk.api.register("deleteCheck", deleteCheck);
  sdk.api.register("executeScan", executeScan);
  sdk.api.register("pauseScan", pauseScan);
  sdk.api.register("resumeScan", resumeScan);
  sdk.api.register("stopScan", stopScan);
  sdk.api.register("getScanResults", getScanResults);
  sdk.api.register("getDiscordWebhooks", getDiscordWebhooks);
  sdk.api.register("saveDiscordWebhook", saveDiscordWebhook);
  sdk.api.register("deleteDiscordWebhook", deleteDiscordWebhook);
  sdk.api.register("getCallbackConfigs", getCallbackConfigs);
  sdk.api.register("saveCallbackConfig", saveCallbackConfig);
  sdk.api.register("deleteCallbackConfig", deleteCallbackConfig);
  sdk.api.register("getPayloadFiles", getPayloadFiles);
  sdk.api.register("savePayloadFile", savePayloadFile);
  sdk.api.register("deletePayloadFile", deletePayloadFile);
  sdk.api.register("getPayloadLists", getPayloadLists);
  sdk.api.register("savePayloadList", savePayloadList);
  sdk.api.register("deletePayloadList", deletePayloadList);
  sdk.api.register("getConstants", getConstants);
  sdk.api.register("saveConstant", saveConstant);
  sdk.api.register("deleteConstant", deleteConstant);

  sdk.events.onProjectChange(() => {
    sdk.api.send(BackendEvent.ProjectChanged, {});
  });
}
