import { computed } from "vue";

import { useSession } from "@/composables/useSession";
import { useSDK } from "@/plugins/sdk";
import { useSessionStore } from "@/stores";
import type { CheckRule } from "@/types";

export function useScan() {
  const sdk = useSDK();
  const sessionStore = useSessionStore();
  const { updateSessionStatus } = useSession();

  const currentScanState = computed(
    () => sessionStore.currentSessionSetup.scanState,
  );

  const launchScan = async (
    sessionId: number,
    requestIds: string[],
    checks: CheckRule[],
    options: { threads: number; delayMs: number; timeoutSec: number },
  ) => {
    if (requestIds.length === 0) {
      sdk.window.showToast("No requests selected", { variant: "error" });
      return;
    }
    if (checks.length === 0) {
      sdk.window.showToast("No checks selected", { variant: "error" });
      return;
    }

    await updateSessionStatus(sessionId, "results");
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
    }
  };

  const pauseScan = async (sessionId: number) => {
    const result = await sdk.backend.pauseScan(sessionId);
    if (result.kind === "Ok") {
      sessionStore.setScanState(sessionId, "paused");
      sdk.window.showToast("Scan paused", { variant: "info" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const resumeScan = async (sessionId: number) => {
    const result = await sdk.backend.resumeScan(sessionId);
    if (result.kind === "Ok") {
      sessionStore.setScanState(sessionId, "running");
      sdk.window.showToast("Scan resumed", { variant: "info" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const stopScan = async (sessionId: number) => {
    const result = await sdk.backend.stopScan(sessionId);
    if (result.kind === "Ok") {
      sessionStore.setScanState(sessionId, "stopped");
      sdk.window.showToast("Scan stopped", { variant: "info" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  return {
    currentScanState,
    launchScan,
    pauseScan,
    resumeScan,
    stopScan,
  };
}
