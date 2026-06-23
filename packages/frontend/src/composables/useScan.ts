import { computed } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useCheckStore, useProfileStore, useSessionStore } from "@/stores";
import type { CheckRule, FrontendSDK, ScanProfile } from "@/types";

type ScanOptions = {
  threads: number;
  delayMs: number;
  timeoutSec: number;
};

export function useScan(providedSdk?: FrontendSDK) {
  const sdk = providedSdk ?? useSDK();
  const checkStore = useCheckStore();
  const profileStore = useProfileStore();
  const sessionStore = useSessionStore();

  const currentScanState = computed(
    () => sessionStore.currentSessionSetup.scanState,
  );

  const launchScan = async (
    sessionId: number,
    requestIds: string[],
    checks: CheckRule[],
    options: ScanOptions,
  ): Promise<boolean> => {
    if (requestIds.length === 0) {
      sdk.window.showToast("No requests selected", { variant: "error" });
      return false;
    }
    if (checks.length === 0) {
      sdk.window.showToast("No checks selected", { variant: "error" });
      return false;
    }

    const updateResult = await sdk.backend.updateSession(sessionId, {
      status: "results",
    });
    if (updateResult.kind === "Error") {
      sdk.window.showToast(updateResult.error, { variant: "error" });
      return false;
    }

    sessionStore.updateSession(updateResult.value);
    sessionStore.setSessionResults(sessionId, []);
    sessionStore.clearSessionSetup(sessionId);
    sessionStore.setScanState(sessionId, "running");

    const result = await sdk.backend.executeScan(
      sessionId,
      requestIds,
      checks,
      options,
    );

    if (result.kind === "Error") {
      sessionStore.setScanState(sessionId, "idle");
      sdk.window.showToast(result.error, { variant: "error" });
      return false;
    }

    return true;
  };

  const getProfile = async (
    profileId: number,
  ): Promise<ScanProfile | undefined> => {
    let profile = profileStore.profiles.find((item) => item.id === profileId);
    if (profile !== undefined) return profile;

    const result = await sdk.backend.getScanProfiles();
    if (result.kind === "Error") {
      sdk.window.showToast(result.error, { variant: "error" });
      return undefined;
    }

    profileStore.setProfiles(result.value);
    profile = result.value.find((item) => item.id === profileId);
    return profile;
  };

  const launchProfileScan = async (
    profileId: number,
    requestIds: string[],
  ): Promise<void> => {
    const profile = await getProfile(profileId);
    if (profile === undefined) {
      sdk.window.showToast("Scan profile is no longer available", {
        variant: "error",
      });
      return;
    }

    const requestsResult = await sdk.backend.getRequestsByIds(requestIds);
    if (requestsResult.kind === "Error") {
      sdk.window.showToast(requestsResult.error, { variant: "error" });
      return;
    }
    if (requestsResult.value.length === 0) {
      sdk.window.showToast("No requests could be loaded", {
        variant: "error",
      });
      return;
    }

    const checksResult = await sdk.backend.getChecks();
    if (checksResult.kind === "Error") {
      sdk.window.showToast(checksResult.error, { variant: "error" });
      return;
    }

    checkStore.setChecks(checksResult.value);
    const checks = checksResult.value.filter((check) =>
      profile.checkIds.includes(check.id),
    );
    if (checks.length !== profile.checkIds.length) {
      sdk.window.showToast(
        `Profile "${profile.name}" contains unavailable checks`,
        { variant: "error" },
      );
      return;
    }

    const createResult = await sdk.backend.createSession();
    if (createResult.kind === "Error") {
      sdk.window.showToast(createResult.error, { variant: "error" });
      return;
    }

    const session = createResult.value;
    const options: ScanOptions = {
      threads: profile.threads,
      delayMs: profile.delayMs,
      timeoutSec: profile.timeoutSec,
    };

    sessionStore.addSession(session);
    sessionStore.selectSession(session.id);
    sessionStore.setSessionSetup(session.id, {
      requests: requestsResult.value,
      checkIds: [...profile.checkIds],
      ...options,
    });

    const started = await launchScan(
      session.id,
      requestsResult.value.map((request) => request.id),
      checks,
      options,
    );
    if (!started) return;

    sdk.window.showToast(`Scan started with "${profile.name}"`, {
      variant: "success",
    });
  };

  const syncScanState = async (sessionId: number): Promise<void> => {
    const result = await sdk.backend.getScanState(sessionId);
    if (result.kind === "Error") {
      sdk.window.showToast(result.error, { variant: "error" });
      return;
    }
    const current = sessionStore.sessionSetup[sessionId]?.scanState;
    if (
      result.value === "idle" &&
      (current === "running" || current === "paused")
    ) {
      return;
    }
    sessionStore.setScanState(sessionId, result.value);
  };

  const pauseScan = async (sessionId: number) => {
    const current = sessionStore.sessionSetup[sessionId]?.scanState;
    if (current === "paused" || current === "stopped" || current === "idle") {
      return;
    }
    sessionStore.setScanState(sessionId, "paused");
    const result = await sdk.backend.pauseScan(sessionId);
    if (result.kind === "Error") {
      sessionStore.setScanState(sessionId, "running");
      sdk.window.showToast(result.error, { variant: "error" });
    } else {
      sdk.window.showToast("Scan paused", { variant: "info" });
    }
  };

  const resumeScan = async (sessionId: number) => {
    const current = sessionStore.sessionSetup[sessionId]?.scanState;
    if (current !== "paused") {
      return;
    }
    sessionStore.setScanState(sessionId, "running");
    const result = await sdk.backend.resumeScan(sessionId);
    if (result.kind === "Error") {
      sessionStore.setScanState(sessionId, "paused");
      sdk.window.showToast(result.error, { variant: "error" });
    } else {
      sdk.window.showToast("Scan resumed", { variant: "info" });
    }
  };

  const stopScan = async (sessionId: number) => {
    const current = sessionStore.sessionSetup[sessionId]?.scanState;
    if (current === "stopped" || current === "idle") {
      return;
    }
    sessionStore.setScanState(sessionId, "stopped");
    const result = await sdk.backend.stopScan(sessionId);
    if (result.kind === "Error") {
      sessionStore.setScanState(sessionId, current ?? "running");
      sdk.window.showToast(result.error, { variant: "error" });
    } else {
      sdk.window.showToast("Scan stopped", { variant: "info" });
    }
  };

  return {
    currentScanState,
    launchScan,
    launchProfileScan,
    syncScanState,
    pauseScan,
    resumeScan,
    stopScan,
  };
}
