import { computed, ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useSessionStore } from "@/stores";
import type { ScanResult } from "@/types";

export function useTable() {
  const sdk = useSDK();
  const sessionStore = useSessionStore();

  const activeRow = ref<Record<string, unknown> | undefined>(undefined);
  const filterText = computed({
    get: () => sessionStore.selectedSession?.resultsFilter ?? "",
    set: (value) => {
      const selectedSession = sessionStore.selectedSession;
      if (selectedSession === undefined) return;
      sessionStore.updateSession({
        ...selectedSession,
        resultsFilter: value,
      });
    },
  });
  const isSearching = ref(false);
  const filteredRequestIds = ref<Set<string> | undefined>(undefined);

  const items = computed(() => {
    const results = sessionStore.currentSessionResults;
    if (filteredRequestIds.value === undefined) return results;

    return results.filter(
      (r) =>
        r.modifiedRequestId !== undefined &&
        filteredRequestIds.value?.has(r.modifiedRequestId) === true,
    );
  });

  const displayItems = computed(() => {
    return items.value.map((r) => ({
      id: r.id,
      modifiedRequestId: r.modifiedRequestId,
      checkName: r.checkName,
      method: r.method,
      host: r.host,
      path: r.path,
      query: r.query,
      statusCode: r.statusCode,
      size: r.size,
      duration: r.duration,
      timestamp: r.timestamp,
      // Keep original for row-select callback
      _original: r,
    }));
  });

  const columns = [
    {
      field: "modifiedRequestId",
      header: "ID",
      sortable: true,
      width: "120px",
    },
    { field: "checkName", header: "Check", sortable: true, width: "120px" },
    { field: "method", header: "Method", sortable: true, width: "70px" },
    { field: "host", header: "Host", sortable: true, width: "140px" },
    { field: "path", header: "Path", sortable: true, width: "200px" },
    { field: "query", header: "Query", sortable: true, width: "120px" },
    { field: "statusCode", header: "Status", sortable: true, width: "60px" },
    { field: "size", header: "Size", sortable: true, width: "60px" },
    { field: "duration", header: "Dur", sortable: true, width: "50px" },
    { field: "timestamp", header: "Time", sortable: true, width: "100px" },
  ];

  const handleRowClick = (event: {
    data: { id: number; _original: ScanResult };
  }) => {
    activeRow.value = event.data as unknown as Record<string, unknown>;
    sessionStore.selectSessionResult(event.data._original.id);
  };

  const handleSearch = async () => {
    const selectedSession = sessionStore.selectedSession;
    if (selectedSession === undefined) return;

    let scanTag = selectedSession.scanTag;
    if (scanTag.trim().length === 0) {
      const sessionsResult = await sdk.backend.getSessions();
      if (sessionsResult.kind === "Error") {
        sdk.window.showToast(sessionsResult.error, { variant: "error" });
        return;
      }
      sessionStore.setSessions(sessionsResult.value);
      scanTag =
        sessionsResult.value.find((s) => s.id === selectedSession.id)
          ?.scanTag ?? "";
    }

    if (scanTag.trim().length === 0) {
      sdk.window.showToast("Scan tag is not available yet", {
        variant: "error",
      });
      return;
    }

    isSearching.value = true;
    const result = await sdk.backend.getFilteredRequests(
      filterText.value,
      scanTag,
    );
    isSearching.value = false;

    if (result.kind === "Error") {
      sdk.window.showToast(result.error, { variant: "error" });
      return;
    }

    const updateResult = await sdk.backend.updateSession(selectedSession.id, {
      resultsFilter: filterText.value,
    });
    if (updateResult.kind === "Ok") {
      sessionStore.updateSession(updateResult.value);
    } else {
      sdk.window.showToast(updateResult.error, { variant: "error" });
    }

    filteredRequestIds.value = new Set(result.value.map((r) => r.id));
    activeRow.value = undefined;
    sessionStore.selectSessionResult(undefined);
  };

  return {
    activeRow,
    filterText,
    items: displayItems,
    columns,
    handleRowClick,
    handleSearch,
  };
}
