import { computed, ref } from "vue";

import { useSessionStore } from "@/stores";
import type { ScanResult } from "@/types";

export function useTable() {
  const sessionStore = useSessionStore();

  const activeRow = ref<Record<string, unknown> | undefined>(undefined);
  const filterText = ref("");

  const items = computed(() => {
    const results = sessionStore.currentSessionResults;
    const q = filterText.value.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (r) =>
        r.checkName?.toLowerCase().includes(q) ??
        r.path.toLowerCase().includes(q) ??
        r.host.toLowerCase().includes(q),
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

  return {
    activeRow,
    filterText,
    items: displayItems,
    columns,
    handleRowClick,
  };
}
