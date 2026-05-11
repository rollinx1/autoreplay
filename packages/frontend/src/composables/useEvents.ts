import { useSession } from "@/composables/useSession";
import { useSessionStore } from "@/stores";
import type { FrontendSDK } from "@/types";

export function useEvents(sdk: FrontendSDK) {
  const sessionStore = useSessionStore();
  const { fetchSessions } = useSession();

  const registerEventListeners = () => {
    sdk.backend.onEvent("scan-result-created", (data) => {
      if (data.sessionId !== sessionStore.selectedSessionId) {
        return;
      }
      sessionStore.addSessionResult(data.sessionId, data.result);
    });

    sdk.backend.onEvent("scan-complete", (data) => {
      if (data.sessionId !== sessionStore.selectedSessionId) {
        return;
      }
      sessionStore.setScanState(data.sessionId, "idle");
      sdk.window.showToast("Scan complete", { variant: "success" });
    });

    sdk.backend.onEvent("project-changed", async () => {
      sessionStore.clearAllSessions();
      await fetchSessions();
    });
  };

  return {
    registerEventListeners,
  };
}
