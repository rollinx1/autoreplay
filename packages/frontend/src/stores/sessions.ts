import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { HttpRequest, ScanResult, ScanState, Session } from "@/types";

type SessionSetup = {
  filter: string;
  requests: HttpRequest[];
  activeId: string | undefined;
  threads: number;
  delayMs: number;
  timeoutSec: number;
  checkIds: number[];
  results: ScanResult[];
  selectedResultId: number | undefined;
  scanState: ScanState;
};

const defaultSetup = (): SessionSetup => ({
  filter: "",
  requests: [],
  activeId: undefined,
  threads: 5,
  delayMs: 0,
  timeoutSec: 30,
  checkIds: [],
  results: [],
  selectedResultId: undefined,
  scanState: "idle",
});

export const useSessionStore = defineStore("session", () => {
  // State
  const sessions = ref<Session[]>([]);
  const selectedSessionId = ref<number | undefined>(undefined);
  const selectedRequestId = ref<string | undefined>(undefined);
  const sessionSetup = ref<Record<string, SessionSetup>>({});

  // Getters
  const requests = computed(() => sessions.value.flatMap((s) => s.requests));

  const selectedSession = computed(() =>
    sessions.value.find((s) => s.id === selectedSessionId.value),
  );

  const selectedRequest = computed(() =>
    requests.value.find((r) => r.id === selectedRequestId.value),
  );

  const currentSessionSetup = computed(() => {
    if (selectedSessionId.value === undefined) return defaultSetup();
    return sessionSetup.value[selectedSessionId.value] ?? defaultSetup();
  });

  const currentSessionChecks = computed(
    () => currentSessionSetup.value.checkIds,
  );

  const currentSessionResults = computed(
    () => currentSessionSetup.value.results,
  );

  const currentScanState = computed(() => currentSessionSetup.value.scanState);

  const selectedResult = computed(() => {
    const setup = currentSessionSetup.value;
    if (setup.selectedResultId === undefined) return undefined;
    return setup.results.find((r) => r.id === setup.selectedResultId);
  });

  // Actions
  const setSessions = (val: Session[]) => {
    sessions.value = val;
  };

  const addSession = (val: Session) => {
    sessions.value = [...sessions.value, val];
  };

  const updateSession = (val: Session) => {
    const idx = sessions.value.findIndex((s) => s.id === val.id);
    if (idx >= 0) {
      const list = [...sessions.value];
      list[idx] = val;
      sessions.value = list;
    } else {
      sessions.value = [...sessions.value, val];
    }
  };

  const removeSession = (id: number) => {
    sessions.value = sessions.value.filter((s) => s.id !== id);
    if (selectedSessionId.value === id) {
      selectedSessionId.value = undefined;
      selectedRequestId.value = undefined;
    }
    const next = { ...sessionSetup.value };
    delete next[id];
    sessionSetup.value = next;
  };

  const clearAllSessions = () => {
    sessions.value = [];
    selectedSessionId.value = undefined;
    selectedRequestId.value = undefined;
    sessionSetup.value = {};
  };

  const selectSession = (id: number | undefined) => {
    selectedSessionId.value = id;
    selectedRequestId.value = undefined;
  };

  const selectRequest = (id: string | undefined) => {
    selectedRequestId.value = id;
  };

  const toggleSessionCheck = (sessionId: number, checkId: number) => {
    const current = sessionSetup.value[sessionId] ?? defaultSetup();
    const list = current.checkIds;
    const idx = list.indexOf(checkId);
    const nextCheckIds =
      idx >= 0 ? list.filter((id) => id !== checkId) : [...list, checkId];
    sessionSetup.value = {
      ...sessionSetup.value,
      [sessionId]: { ...current, checkIds: nextCheckIds },
    };
  };

  const setSessionChecks = (sessionId: number, checkIds: number[]) => {
    const current = sessionSetup.value[sessionId] ?? defaultSetup();
    sessionSetup.value = {
      ...sessionSetup.value,
      [sessionId]: { ...current, checkIds },
    };
  };

  const setSessionSetup = (sessionId: number, patch: Partial<SessionSetup>) => {
    const current = sessionSetup.value[sessionId] ?? defaultSetup();
    sessionSetup.value = {
      ...sessionSetup.value,
      [sessionId]: { ...current, ...patch },
    };
  };

  const setSessionResults = (sessionId: number, val: ScanResult[]) => {
    const current = sessionSetup.value[sessionId] ?? defaultSetup();
    sessionSetup.value = {
      ...sessionSetup.value,
      [sessionId]: { ...current, results: val },
    };
  };

  const addSessionResult = (sessionId: number, val: ScanResult) => {
    const current = sessionSetup.value[sessionId] ?? defaultSetup();
    sessionSetup.value = {
      ...sessionSetup.value,
      [sessionId]: { ...current, results: [...current.results, val] },
    };
  };

  const selectSessionResult = (id: number | undefined) => {
    const sessionId = selectedSessionId.value;
    if (sessionId === undefined) return;
    const current = sessionSetup.value[sessionId] ?? defaultSetup();
    sessionSetup.value = {
      ...sessionSetup.value,
      [sessionId]: { ...current, selectedResultId: id },
    };
  };

  const setScanState = (sessionId: number, state: ScanState) => {
    const current = sessionSetup.value[sessionId] ?? defaultSetup();
    sessionSetup.value = {
      ...sessionSetup.value,
      [sessionId]: { ...current, scanState: state },
    };
  };

  const clearSessionSetup = (sessionId: number) => {
    const current = sessionSetup.value[sessionId] ?? defaultSetup();
    sessionSetup.value = {
      ...sessionSetup.value,
      [sessionId]: {
        ...current,
        filter: "",
        requests: [],
        activeId: undefined,
        threads: 5,
        delayMs: 0,
        timeoutSec: 30,
        checkIds: [],
        scanState: "idle",
      },
    };
  };

  return {
    // State
    sessions,
    selectedSessionId,
    selectedRequestId,
    sessionSetup,
    // Getters
    requests,
    selectedSession,
    selectedRequest,
    currentSessionChecks,
    currentSessionSetup,
    currentSessionResults,
    currentScanState,
    selectedResult,
    // Actions
    setSessions,
    addSession,
    updateSession,
    removeSession,
    clearAllSessions,
    selectSession,
    selectRequest,
    toggleSessionCheck,
    setSessionChecks,
    setSessionSetup,
    setSessionResults,
    addSessionResult,
    selectSessionResult,
    setScanState,
    clearSessionSetup,
  };
});
