import type { SDK } from "caido:plugin";

import {
  deleteResource as deleteResourceDb,
  getResources as getResourcesDb,
  upsertResource as upsertResourceDb,
} from "../database";
import type { Resource, Result } from "../types";

// ─── Generic CRUD (escape hatch) ───

const getResources = async (
  sdk: SDK,
  type?: string,
): Promise<Result<Resource[]>> => {
  try {
    const rows = await getResourcesDb(sdk, type);
    const resources: Resource[] = rows.map((row) => ({
      id: row.id,
      type: row.type,
      identifier: row.identifier,
      data: row.data,
    }));
    return { kind: "Ok", value: resources };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

const upsertResource = async (
  sdk: SDK,
  type: string,
  identifier: string,
  data: string,
): Promise<Result<void>> => {
  try {
    await upsertResourceDb(sdk, type, identifier, data);
    return { kind: "Ok", value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

const deleteResource = async (
  sdk: SDK,
  type: string,
  identifier: string,
): Promise<Result<void>> => {
  try {
    await deleteResourceDb(sdk, type, identifier);
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
  const result = await getResources(sdk, "discord");
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
  return upsertResource(sdk, "discord", identifier, JSON.stringify({ url }));
};

export const deleteDiscordWebhook = async (
  sdk: SDK,
  identifier: string,
): Promise<Result<void>> => {
  return deleteResource(sdk, "discord", identifier);
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
  const result = await getResources(sdk, "file");
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
  return upsertResource(
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
  return deleteResource(sdk, "file", identifier);
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
  const result = await getResources(sdk, "list");
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
  return upsertResource(
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
  return deleteResource(sdk, "list", identifier);
};

type Constant = {
  id: number;
  identifier: string;
  value: string;
};

export const getConstants = async (sdk: SDK): Promise<Result<Constant[]>> => {
  const result = await getResources(sdk, "constant");
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
  return upsertResource(sdk, "constant", identifier, JSON.stringify({ value }));
};

export const deleteConstant = async (
  sdk: SDK,
  identifier: string,
): Promise<Result<void>> => {
  return deleteResource(sdk, "constant", identifier);
};
