import { useSession } from "@/composables/useSession";
import { useSessionStore } from "@/stores";
import type { FrontendSDK } from "@/types";

export function useEvents(sdk: FrontendSDK) {
  const sessionStore = useSessionStore();
  const { fetchSessions } = useSession();

  const registerEventListeners = () => {
    sdk.backend.onEvent("scan-result-created", (sessionId, result) => {
      if (sessionId !== sessionStore.selectedSessionId) {
        return;
      }
      sessionStore.addSessionResult(sessionId, result);
    });

    sdk.backend.onEvent("scan-complete", (sessionId) => {
      if (sessionId !== sessionStore.selectedSessionId) {
        return;
      }
      sessionStore.setScanState(sessionId, "idle");
      void fetchSessions();
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
