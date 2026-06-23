import type { SDK } from "caido:plugin";

import {
  deleteScanProfile as deleteScanProfileDb,
  getScanProfile,
  getScanProfiles as getScanProfilesDb,
  insertScanProfile,
  updateScanProfile as updateScanProfileDb,
} from "../database";
import type { Result, ScanProfile } from "../types";

type ProfileInput = Omit<ScanProfile, "id" | "createdAt">;

const validateProfile = (
  profile: Partial<ProfileInput>,
  requireComplete: boolean,
): string | undefined => {
  if (
    (requireComplete && profile.name === undefined) ||
    profile.name?.trim() === ""
  ) {
    return "Profile name is required";
  }
  if (requireComplete && profile.checkIds === undefined) {
    return "Check configuration is required";
  }
  if (
    profile.checkIds !== undefined &&
    profile.checkIds.some((id) => !Number.isInteger(id) || id < 1)
  ) {
    return "Check IDs must be positive integers";
  }
  if (
    (requireComplete && profile.threads === undefined) ||
    (profile.threads !== undefined &&
      (!Number.isInteger(profile.threads) || profile.threads < 1))
  ) {
    return "Threads must be a positive integer";
  }
  if (
    (requireComplete && profile.delayMs === undefined) ||
    (profile.delayMs !== undefined &&
      (!Number.isInteger(profile.delayMs) || profile.delayMs < 0))
  ) {
    return "Delay must be a non-negative integer";
  }
  if (
    (requireComplete && profile.timeoutSec === undefined) ||
    (profile.timeoutSec !== undefined &&
      (!Number.isInteger(profile.timeoutSec) || profile.timeoutSec < 1))
  ) {
    return "Timeout must be a positive integer";
  }
  return undefined;
};

export const addScanProfile = async (
  sdk: SDK,
  profile: ProfileInput,
): Promise<Result<ScanProfile>> => {
  const validationError = validateProfile(profile, true);
  if (validationError !== undefined) {
    return { kind: "Error", error: validationError };
  }

  try {
    const id = await insertScanProfile(sdk, {
      ...profile,
      name: profile.name.trim(),
      checkIds: [...new Set(profile.checkIds)],
    });
    const created = await getScanProfile(sdk, id);
    if (created === undefined) {
      return { kind: "Error", error: "Failed to load created scan profile" };
    }
    return { kind: "Ok", value: created };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const getScanProfiles = async (
  sdk: SDK,
): Promise<Result<ScanProfile[]>> => {
  try {
    return { kind: "Ok", value: await getScanProfilesDb(sdk) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const updateScanProfile = async (
  sdk: SDK,
  id: number,
  updates: Partial<ProfileInput>,
): Promise<Result<ScanProfile>> => {
  const validationError = validateProfile(updates, false);
  if (validationError !== undefined) {
    return { kind: "Error", error: validationError };
  }

  try {
    const existing = await getScanProfile(sdk, id);
    if (existing === undefined) {
      return { kind: "Error", error: "Scan profile not found" };
    }

    await updateScanProfileDb(sdk, id, {
      name: updates.name?.trim(),
      checkIds:
        updates.checkIds === undefined
          ? undefined
          : [...new Set(updates.checkIds)],
      threads: updates.threads,
      delayMs: updates.delayMs,
      timeoutSec: updates.timeoutSec,
    });

    const updated = await getScanProfile(sdk, id);
    if (updated === undefined) {
      return { kind: "Error", error: "Failed to load updated scan profile" };
    }
    return { kind: "Ok", value: updated };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const deleteScanProfile = async (
  sdk: SDK,
  id: number,
): Promise<Result<void>> => {
  try {
    await deleteScanProfileDb(sdk, id);
    return { kind: "Ok", value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};
