import type { SDK } from "caido:plugin";

import {
  deleteCheck as deleteCheckDb,
  getCheck,
  getChecks as getChecksDb,
  insertCheck,
  updateCheck as updateCheckDb,
} from "../database";
import type { CheckRule, Result } from "../types";

export const addCheck = async (
  sdk: SDK,
  rule: Omit<CheckRule, "id">,
): Promise<Result<CheckRule>> => {
  try {
    sdk.console.log("Adding check rule");
    const id = await insertCheck(sdk, {
      name: rule.name,
      description: rule.description,
      code: rule.code,
    });
    const check: CheckRule = { ...rule, id };
    return { kind: "Ok", value: check };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const getChecks = async (sdk: SDK): Promise<Result<CheckRule[]>> => {
  try {
    const checks = await getChecksDb(sdk);
    return { kind: "Ok", value: checks };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const updateCheck = async (
  sdk: SDK,
  id: number,
  updates: Partial<Omit<CheckRule, "id">>,
): Promise<Result<CheckRule>> => {
  try {
    const existing = await getCheck(sdk, id);
    if (existing === undefined) {
      return { kind: "Error", error: "Check not found" };
    }
    await updateCheckDb(sdk, id, {
      name: updates.name,
      description: updates.description,
      code: updates.code,
    });
    const updated: CheckRule = { ...existing, ...updates };
    return { kind: "Ok", value: updated };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const deleteCheck = async (
  sdk: SDK,
  id: number,
): Promise<Result<void>> => {
  try {
    await deleteCheckDb(sdk, id);
    return { kind: "Ok", value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};
