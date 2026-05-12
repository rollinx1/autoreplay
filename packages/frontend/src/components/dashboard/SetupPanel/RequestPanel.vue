<script setup lang="ts">
import {
  Card,
  HttpqlInput,
  MultiDataTable,
  RequestEditor,
} from "@caido-utils/ui-components";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { computed, ref, watch } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useSessionStore } from "@/stores";
import type { HttpRequest } from "@/types";

const sdk = useSDK();
const sessionStore = useSessionStore();
const sessionId = computed(() => sessionStore.selectedSessionId);

const rawRequest = ref<string | undefined>(undefined);
const isSearching = ref(false);

const httpqlFilter = computed({
  get: () => sessionStore.currentSessionSetup.filter,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { filter: v });
    }
  },
});

const fetchedRequests = computed({
  get: () => sessionStore.currentSessionSetup.requests,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { requests: v });
    }
  },
});

const selectedIds = computed({
  get: () => sessionStore.currentSessionSetup.selectedIds,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { selectedIds: v });
    }
  },
});

const activeId = computed({
  get: () => sessionStore.currentSessionSetup.activeId,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { activeId: v });
    }
  },
});

const selectedRows = computed({
  get: () =>
    fetchedRequests.value.filter((r) => selectedIds.value.includes(r.id)),
  set: (v: HttpRequest[]) => {
    selectedIds.value = v.map((r) => r.id);
  },
});

const activeRow = computed({
  get: () => fetchedRequests.value.find((r) => r.id === activeId.value),
  set: (v: HttpRequest | undefined) => {
    activeId.value = v?.id;
  },
});

const filteredRequests = computed(() => fetchedRequests.value);

watch(
  () => activeRow.value,
  async (req) => {
    if (req === undefined) {
      rawRequest.value = undefined;
      return;
    }
    const data = await sdk.backend.getRequestResponse(req.id);
    rawRequest.value = data?.rawRequest;
  },
  { immediate: true },
);

const onSearch = async () => {
  isSearching.value = true;
  const result = await sdk.backend.getSetupRequests(httpqlFilter.value, true);
  isSearching.value = false;
  if (result.kind === "Ok") {
    fetchedRequests.value = result.value;
    selectedIds.value = [];
    activeId.value = undefined;
  } else {
    sdk.window.showToast(result.error, { variant: "error" });
  }
};

const onRowClick = (event: { data: Record<string, unknown> }) => {
  activeRow.value = event.data as HttpRequest;
};
</script>

<template>
  <Splitter
    class="h-full"
    layout="vertical"
    :pt="{
      root: { style: 'border: none' },
      gutter: {
        class: 'border-none bg-surface-950 cursor-row-resize',
      },
      panel: { style: 'border: none' },
    }"
  >
    <!-- Table -->
    <SplitterPanel
      :size="55"
      :min-size="10"
      class="overflow-hidden flex flex-col"
    >
      <Card class="flex-1 min-h-0 overflow-hidden">
        <template #content>
          <div class="h-full flex flex-col min-h-0">
            <!-- Filter -->
            <div class="px-3 py-2 border-b border-surface-700 flex shrink-0">
              <HttpqlInput
                v-model="httpqlFilter"
                placeholder="Filter requests (method, host, path)..."
                class="flex-1"
                @keyup.enter="onSearch"
              />
            </div>

            <div class="flex-1 min-h-0 flex flex-col">
              <MultiDataTable
                v-model="selectedRows"
                :items="filteredRequests"
                :columns="[
                  { field: 'method', header: 'Method', width: '80px' },
                  { field: 'host', header: 'Host', width: '250px' },
                  { field: 'path', header: 'Path', width: '300px' },
                  { field: 'query', header: 'Query', width: '200px' },
                ]"
                data-key="id"
                scroll-key="requests-table"
                class="h-full"
                :loading="isSearching"
                @row-click="onRowClick"
              >
                <template #cell-method="{ item }">
                  <span
                    class="px-2 py-0.5 rounded text-xs font-semibold"
                    :class="
                      item.method === 'GET'
                        ? 'bg-green-900/50 text-green-300'
                        : item.method === 'POST'
                          ? 'bg-yellow-900/50 text-yellow-300'
                          : item.method === 'PUT'
                            ? 'bg-blue-900/50 text-blue-300'
                            : item.method === 'DELETE'
                              ? 'bg-red-900/50 text-red-300'
                              : 'bg-surface-700 text-surface-300'
                    "
                  >
                    {{ item.method }}
                  </span>
                </template>
                <template #empty>
                  <div
                    class="flex-1 flex flex-col items-center justify-center text-surface-500 text-sm"
                  >
                    <i class="fas fa-globe text-2xl mb-2 opacity-50" />
                    <p>No requests match this filter</p>
                  </div>
                </template>
              </MultiDataTable>
            </div>
          </div>
        </template>
      </Card>
    </SplitterPanel>

    <!-- Preview -->
    <SplitterPanel
      :size="45"
      :min-size="10"
      class="overflow-hidden flex flex-col"
    >
      <Card class="flex-1 min-h-0 overflow-hidden">
        <template #content>
          <div class="h-full flex flex-col">
            <RequestEditor
              v-if="rawRequest !== undefined"
              :key="activeRow?.id"
              :sdk="sdk"
              :content="rawRequest"
            />
            <div
              v-else
              class="h-full flex items-center justify-center text-surface-500 text-xs"
            >
              <p>Click a request to preview</p>
            </div>
          </div>
        </template>
      </Card>
    </SplitterPanel>
  </Splitter>
</template>
