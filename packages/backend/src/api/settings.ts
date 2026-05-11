import type { SDK } from "caido:plugin";

import {
  deleteSetting as deleteSettingDb,
  getSettings as getSettingsDb,
  upsertSetting as upsertSettingDb,
} from "../database";
import type { Result, Setting } from "../types";

// ─── Generic CRUD (escape hatch) ───

const getSettings = async (
  sdk: SDK,
  type?: string,
): Promise<Result<Setting[]>> => {
  try {
    const rows = await getSettingsDb(sdk, type);
    const settings: Setting[] = rows.map((row) => ({
      id: row.id,
      type: row.type,
      identifier: row.identifier,
      data: row.data,
    }));
    return { kind: "Ok", value: settings };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

const upsertSetting = async (
  sdk: SDK,
  type: string,
  identifier: string,
  data: string,
): Promise<Result<void>> => {
  try {
    await upsertSettingDb(sdk, type, identifier, data);
    return { kind: "Ok", value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

const deleteSetting = async (
  sdk: SDK,
  type: string,
  identifier: string,
): Promise<Result<void>> => {
  try {
    await deleteSettingDb(sdk, type, identifier);
    return { kind: "Ok", value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

// ─── Typed wrappers ───

type DiscordWebhook = {
  id: number;
  identifier: string;
  url: string;
};

export const getDiscordWebhooks = async (
  sdk: SDK,
): Promise<Result<DiscordWebhook[]>> => {
  const result = await getSettings(sdk, "discord");
  if (result.kind === "Error") return result;

  const webhooks: DiscordWebhook[] = result.value.map((s) => {
    const parsed = JSON.parse(s.data) as { url: string };
    return {
      id: s.id,
      identifier: s.identifier,
      url: parsed.url,
    };
  });

  return { kind: "Ok", value: webhooks };
};

export const saveDiscordWebhook = async (
  sdk: SDK,
  identifier: string,
  url: string,
): Promise<Result<void>> => {
  return upsertSetting(sdk, "discord", identifier, JSON.stringify({ url }));
};

export const deleteDiscordWebhook = async (
  sdk: SDK,
  identifier: string,
): Promise<Result<void>> => {
  return deleteSetting(sdk, "discord", identifier);
};

type CallbackConfig = {
  id: number;
  identifier: string;
  providerUrl: string;
};

export const getCallbackConfigs = async (
  sdk: SDK,
): Promise<Result<CallbackConfig[]>> => {
  const result = await getSettings(sdk, "callback");
  if (result.kind === "Error") return result;

  const configs: CallbackConfig[] = result.value.map((s) => {
    const parsed = JSON.parse(s.data) as { providerUrl: string };
    return {
      id: s.id,
      identifier: s.identifier,
      providerUrl: parsed.providerUrl,
    };
  });

  return { kind: "Ok", value: configs };
};

export const saveCallbackConfig = async (
  sdk: SDK,
  identifier: string,
  providerUrl: string,
): Promise<Result<void>> => {
  return upsertSetting(
    sdk,
    "callback",
    identifier,
    JSON.stringify({ providerUrl }),
  );
};

export const deleteCallbackConfig = async (
  sdk: SDK,
  identifier: string,
): Promise<Result<void>> => {
  return deleteSetting(sdk, "callback", identifier);
};

type PayloadFile = {
  id: number;
  identifier: string;
  name: string;
  content: string;
};

export const getPayloadFiles = async (
  sdk: SDK,
): Promise<Result<PayloadFile[]>> => {
  const result = await getSettings(sdk, "file");
  if (result.kind === "Error") return result;

  const files: PayloadFile[] = result.value.map((s) => {
    const parsed = JSON.parse(s.data) as { name: string; content: string };
    return {
      id: s.id,
      identifier: s.identifier,
      name: parsed.name,
      content: parsed.content,
    };
  });

  return { kind: "Ok", value: files };
};

export const savePayloadFile = async (
  sdk: SDK,
  identifier: string,
  name: string,
  content: string,
): Promise<Result<void>> => {
  return upsertSetting(
    sdk,
    "file",
    identifier,
    JSON.stringify({ name, content }),
  );
};

export const deletePayloadFile = async (
  sdk: SDK,
  identifier: string,
): Promise<Result<void>> => {
  return deleteSetting(sdk, "file", identifier);
};

type PayloadList = {
  id: number;
  identifier: string;
  name: string;
  items: string[];
};

export const getPayloadLists = async (
  sdk: SDK,
): Promise<Result<PayloadList[]>> => {
  const result = await getSettings(sdk, "list");
  if (result.kind === "Error") return result;

  const lists: PayloadList[] = result.value.map((s) => {
    const parsed = JSON.parse(s.data) as { name: string; items: string[] };
    return {
      id: s.id,
      identifier: s.identifier,
      name: parsed.name,
      items: parsed.items,
    };
  });

  return { kind: "Ok", value: lists };
};

export const savePayloadList = async (
  sdk: SDK,
  identifier: string,
  name: string,
  items: string[],
): Promise<Result<void>> => {
  return upsertSetting(
    sdk,
    "list",
    identifier,
    JSON.stringify({ name, items }),
  );
};

export const deletePayloadList = async (
  sdk: SDK,
  identifier: string,
): Promise<Result<void>> => {
  return deleteSetting(sdk, "list", identifier);
};

type Constant = {
  id: number;
  identifier: string;
  value: string;
};

export const getConstants = async (sdk: SDK): Promise<Result<Constant[]>> => {
  const result = await getSettings(sdk, "constant");
  if (result.kind === "Error") return result;

  const constants: Constant[] = result.value.map((s) => {
    const parsed = JSON.parse(s.data) as { value: string };
    return {
      id: s.id,
      identifier: s.identifier,
      value: parsed.value,
    };
  });

  return { kind: "Ok", value: constants };
};

export const saveConstant = async (
  sdk: SDK,
  identifier: string,
  value: string,
): Promise<Result<void>> => {
  return upsertSetting(sdk, "constant", identifier, JSON.stringify({ value }));
};

export const deleteConstant = async (
  sdk: SDK,
  identifier: string,
): Promise<Result<void>> => {
  return deleteSetting(sdk, "constant", identifier);
};
