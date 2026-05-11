<script setup lang="ts">
import {
  Card,
  HttpqlInput,
  MultiDataTable,
  RequestEditor,
} from "@caido-utils/ui-components";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { computed, ref, watch } from "vue";

import { useScan } from "@/composables/useScan";
import { useSDK } from "@/plugins/sdk";
import { useCheckStore, useSessionStore } from "@/stores";
import type { HttpRequest } from "@/types";

const sdk = useSDK();
const sessionStore = useSessionStore();
const checkStore = useCheckStore();
const { launchScan } = useScan();

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

const threads = computed({
  get: () => sessionStore.currentSessionSetup.threads,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { threads: v });
    }
  },
});

const delayMs = computed({
  get: () => sessionStore.currentSessionSetup.delayMs,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { delayMs: v });
    }
  },
});

const timeoutSec = computed({
  get: () => sessionStore.currentSessionSetup.timeoutSec,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { timeoutSec: v });
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
  const result = await sdk.backend.getSetupRequests(httpqlFilter.value);
  isSearching.value = false;
  if (result.kind === "Ok") {
    fetchedRequests.value = result.value;
    selectedIds.value = [];
    activeId.value = undefined;
  } else {
    sdk.window.showToast(result.error, { variant: "error" });
  }
};

const selectedCount = computed(() => selectedIds.value.length);

const sessionCheckIds = computed(() => sessionStore.currentSessionChecks);
const activeCheckCount = computed(() => sessionCheckIds.value.length);

const scanState = computed(() => sessionStore.currentSessionSetup.scanState);
const isScanning = computed(
  () => scanState.value === "running" || scanState.value === "paused",
);

const canLaunch = computed(
  () =>
    selectedCount.value > 0 && activeCheckCount.value > 0 && !isScanning.value,
);

const onLaunch = async () => {
  if (!canLaunch.value) return;

  const id = sessionId.value;
  if (id === undefined) return;

  const requestIds = selectedRows.value.map((r) => r.id);

  const checks = checkStore.checks.filter((c) =>
    sessionCheckIds.value.includes(c.id),
  );

  await launchScan(id, requestIds, checks, {
    threads: threads.value,
    delayMs: delayMs.value,
    timeoutSec: timeoutSec.value,
  });
};

const toggleSessionCheck = (checkId: number) => {
  const id = sessionId.value;
  if (id === undefined) return;
  sessionStore.toggleSessionCheck(id, checkId);
};

const onRowClick = (event: { data: Record<string, unknown> }) => {
  activeRow.value = event.data as HttpRequest;
};

const rightTab = ref<"checks" | "settings">("checks");
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <!-- Header -->
    <Card class="shrink-0">
      <template #content>
        <div class="flex items-center justify-between px-4 py-3">
          <h2 class="text-base font-bold text-surface-100">
            {{ sessionStore.selectedSession?.name ?? "No session" }}
          </h2>
          <Button
            icon="fas fa-rocket"
            label="Launch"
            size="small"
            :disabled="!canLaunch"
            :loading="isScanning"
            @click="onLaunch"
          />
        </div>
      </template>
    </Card>

    <!-- Main area -->
    <div class="flex-1 min-h-0 overflow-hidden">
      <Splitter
        class="h-full"
        layout="horizontal"
        :pt="{
          root: { style: 'border: none' },
          gutter: { class: 'border-none bg-surface-950 cursor-col-resize' },
          panel: { style: 'border: none' },
        }"
      >
        <!-- Left: Table + Preview -->
        <SplitterPanel :size="67" :min-size="40" class="overflow-hidden">
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
                    <div
                      class="px-3 py-2 border-b border-surface-700 flex shrink-0"
                    >
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
                          { field: 'host', header: 'Host', width: '200px' },
                          { field: 'path', header: 'Path' },
                          { field: 'query', header: 'Query' },
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
        </SplitterPanel>

        <!-- Right: Checks + Settings -->
        <SplitterPanel :size="33" :min-size="20" class="overflow-hidden">
          <Card class="h-full flex flex-col">
            <template #content>
              <div class="h-full flex flex-col">
                <!-- Tabs -->
                <div class="flex border-b border-surface-700 shrink-0">
                  <button
                    class="px-3 py-2 text-xs font-semibold"
                    :class="
                      rightTab === 'checks'
                        ? 'text-secondary-400 border-b-2 border-secondary-400'
                        : 'text-surface-500 hover:text-surface-300'
                    "
                    @click="rightTab = 'checks'"
                  >
                    Checks
                  </button>
                  <button
                    class="px-3 py-2 text-xs font-semibold"
                    :class="
                      rightTab === 'settings'
                        ? 'text-secondary-400 border-b-2 border-secondary-400'
                        : 'text-surface-500 hover:text-surface-300'
                    "
                    @click="rightTab = 'settings'"
                  >
                    Settings
                  </button>
                </div>

                <!-- Checks tab -->
                <div
                  v-if="rightTab === 'checks'"
                  class="flex-1 min-h-0 overflow-y-auto px-3 py-2"
                >
                  <div
                    v-for="m in checkStore.checks"
                    :key="m.id"
                    class="flex items-center gap-2 py-1.5"
                  >
                    <Checkbox
                      :model-value="sessionCheckIds.includes(m.id)"
                      binary
                      @update:model-value="toggleSessionCheck(m.id)"
                    />
                    <div class="min-w-0 flex-1">
                      <span
                        class="text-xs text-surface-300 truncate"
                        :title="m.name"
                      >
                        {{ m.name }}
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="checkStore.checks.length === 0"
                    class="py-4 text-center text-surface-500 text-xs"
                  >
                    <i class="fas fa-flask text-xl mb-2 opacity-50" />
                    <p>No checks</p>
                  </div>
                </div>

                <!-- Settings tab -->
                <div
                  v-if="rightTab === 'settings'"
                  class="flex-1 min-h-0 overflow-y-auto px-3 py-2"
                >
                  <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-surface-400">Threads</span>
                      <InputNumber
                        v-model="threads"
                        :min="1"
                        :max="50"
                        size="small"
                        input-class="w-32"
                      />
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-surface-400">Delay (ms)</span>
                      <InputNumber
                        v-model="delayMs"
                        :min="0"
                        size="small"
                        input-class="w-32"
                      />
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-surface-400">Timeout (s)</span>
                      <InputNumber
                        v-model="timeoutSec"
                        :min="1"
                        size="small"
                        input-class="w-32"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </SplitterPanel>
      </Splitter>
    </div>
  </div>
</template>
