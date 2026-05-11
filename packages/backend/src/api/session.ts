import type { SDK } from "caido:plugin";

import {
  deleteSession as deleteSessionDb,
  getSession as getSessionDb,
  getSessions as getSessionsDb,
  insertSession,
  updateSession as updateSessionDb,
} from "../database";
import type { Result, Session } from "../types";

export const createSession = async (sdk: SDK): Promise<Result<Session>> => {
  try {
    sdk.console.log("Creating session");
    const id = await insertSession(sdk, {
      name: `Session ${new Date().toISOString()}`,
      status: "setup",
    });
    const session = await getSessionDb(sdk, id);
    if (session === undefined) {
      return { kind: "Error", error: "Failed to create session" };
    }
    return { kind: "Ok", value: session };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const getSessions = async (sdk: SDK): Promise<Result<Session[]>> => {
  try {
    const sessions = await getSessionsDb(sdk);
    return { kind: "Ok", value: sessions };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const deleteSession = async (
  sdk: SDK,
  id: number,
): Promise<Result<void>> => {
  try {
    await deleteSessionDb(sdk, id);
    return { kind: "Ok", value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const clearSessions = async (sdk: SDK): Promise<Result<void>> => {
  try {
    const sessions = await getSessionsDb(sdk);
    for (const session of sessions) {
      await deleteSessionDb(sdk, session.id);
    }
    return { kind: "Ok", value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const updateSession = async (
  sdk: SDK,
  id: number,
  input: { name?: string; status?: "setup" | "results" },
): Promise<Result<Session>> => {
  try {
    await updateSessionDb(sdk, id, input);
    const session = await getSessionDb(sdk, id);
    if (session === undefined) {
      return { kind: "Error", error: "Session not found after update" };
    }
    return { kind: "Ok", value: session };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};
