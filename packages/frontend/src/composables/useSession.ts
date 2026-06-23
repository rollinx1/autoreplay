import { storeToRefs } from "pinia";
import { ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useSessionStore } from "@/stores";

export function useSession() {
  const sdk = useSDK();
  const store = useSessionStore();
  const { sessions, selectedSession, selectedSessionId } = storeToRefs(store);
  const isLoading = ref(false);
  const error = ref<string | undefined>(undefined);

  const fetchSessions = async () => {
    const result = await sdk.backend.getSessions();
    if (result.kind === "Ok") {
      store.setSessions(result.value);
    } else {
      error.value = result.error;
    }
  };

  const createSession = async () => {
    const result = await sdk.backend.createSession();
    if (result.kind === "Ok") {
      store.addSession(result.value);
      store.selectSession(result.value.id);
      sdk.window.showToast("Session created", { variant: "success" });
      return result.value;
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
      return undefined;
    }
  };

  const deleteSession = async (id: number) => {
    const result = await sdk.backend.deleteSession(id);
    if (result.kind === "Ok") {
      store.removeSession(id);
      sdk.window.showToast("Session deleted", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const clearSessions = async () => {
    const result = await sdk.backend.clearSessions();
    if (result.kind === "Ok") {
      store.clearAllSessions();
      sdk.window.showToast("All sessions cleared", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const updateSession = async (
    id: number,
    input: {
      name?: string;
      status?: "setup" | "results";
      setupFilter?: string;
      resultsFilter?: string;
    },
  ) => {
    const result = await sdk.backend.updateSession(id, input);
    if (result.kind === "Ok") {
      store.updateSession(result.value);
      if (
        input.setupFilter === undefined &&
        input.resultsFilter === undefined
      ) {
        sdk.window.showToast("Session updated", { variant: "success" });
      }
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const selectSessionAndFetch = async (id: number) => {
    const session = store.sessions.find((s) => s.id === id);
    store.selectSession(id, session?.setupFilter);

    if (session?.status === "results") {
      const result = await sdk.backend.getScanResults(id);
      if (result.kind === "Ok") {
        store.setSessionResults(id, result.value);
      }
    }
  };

  return {
    isLoading,
    error,
    sessions,
    selectedSession,
    selectedSessionId,
    fetchSessions,
    createSession,
    deleteSession,
    clearSessions,
    updateSession,
    selectSession: selectSessionAndFetch,
  };
}
