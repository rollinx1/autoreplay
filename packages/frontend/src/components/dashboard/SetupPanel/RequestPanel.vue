<script setup lang="ts">
import {
  Card,
  DataTable,
  HttpqlInput,
  RequestEditor,
} from "@caido-utils/ui-components";
import Button from "primevue/button";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { computed, nextTick, ref, watch } from "vue";

import { useSession } from "@/composables/useSession";
import { useSDK } from "@/plugins/sdk";
import { useSessionStore } from "@/stores";
import type { HttpRequest } from "@/types";

const sdk = useSDK();
const sessionStore = useSessionStore();
const { updateSession } = useSession();
const sessionId = computed(() => sessionStore.selectedSessionId);

const emit = defineEmits<{
  "open-advanced": [];
}>();

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

const activeId = computed({
  get: () => sessionStore.currentSessionSetup.activeId,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { activeId: v });
    }
  },
});

const activeRow = computed({
  get: () => fetchedRequests.value.find((r) => r.id === activeId.value),
  set: (v: HttpRequest | undefined) => {
    activeId.value = v?.id;
  },
});

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
  const setup = sessionStore.currentSessionSetup;
  const result = await sdk.backend.getSetupRequests(httpqlFilter.value, {
    deduplicate: setup.deduplicate,
    inScope: setup.inScope,
    noJavascript: setup.noJavascript,
    noImages: setup.noImages,
    noVideos: setup.noVideos,
    noDocuments: setup.noDocuments,
    noStyling: setup.noStyling,
    timeFilter: setup.timeFilter,
  });
  isSearching.value = false;
  if (result.kind === "Ok") {
    fetchedRequests.value = result.value;
    activeId.value = undefined;
    if (sessionId.value !== undefined) {
      void updateSession(sessionId.value, { setupFilter: httpqlFilter.value });
    }
  } else {
    sdk.window.showToast(result.error, { variant: "error" });
  }
};

const onRowClick = (event: { data: Record<string, unknown> }) => {
  activeRow.value = event.data as HttpRequest;
};

const onDeleteRow = (row: HttpRequest) => {
  fetchedRequests.value = fetchedRequests.value.filter((r) => r.id !== row.id);
  if (activeId.value === row.id) {
    activeId.value = undefined;
  }
};

watch(
  () => fetchedRequests.value.length,
  async (newLen, oldLen) => {
    if (newLen > 0 && (oldLen === undefined || oldLen === 0)) {
      await nextTick();
      window.dispatchEvent(new Event("resize"));
    }
  },
);
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
            <div
              class="px-3 py-2 border-b border-surface-700 flex items-center gap-2 shrink-0 relative"
            >
              <HttpqlInput
                v-model="httpqlFilter"
                placeholder="Filter requests (method, host, path)..."
                class="flex-1"
                @keyup.enter="onSearch"
              />
              <Button
                icon="fas fa-cog"
                text
                size="small"
                class="text-surface-400 hover:text-surface-300"
                @click="emit('open-advanced')"
              />
            </div>

            <div class="flex-1 min-h-0 flex flex-col relative">
              <DataTable
                v-model:active-row="activeRow"
                :items="fetchedRequests"
                :columns="[
                  { field: 'method', header: 'Method', width: '80px' },
                  { field: 'host', header: 'Host' },
                  { field: 'path', header: 'Path' },
                  { field: 'query', header: 'Query' },
                  { field: 'actions', header: '', width: '50px' },
                ]"
                data-key="id"
                scroll-key="requests-table"
                :row-height="30"
                class="h-full"
                :loading="isSearching"
                @row-click="onRowClick"
              >
                <template #cell-actions="{ item }">
                  <button
                    class="text-red-400 hover:text-red-300 transition-colors text-xs leading-none pl-2"
                    @click.stop="onDeleteRow(item)"
                  >
                    <i class="fas fa-trash" />
                  </button>
                </template>
              </DataTable>
              <div
                v-if="fetchedRequests.length === 0 && !isSearching"
                class="absolute inset-0 flex flex-col items-center justify-center text-surface-500 text-sm pointer-events-none"
              >
                <i class="fas fa-globe text-2xl mb-2 opacity-50" />
                <p>No requests match this filter</p>
              </div>
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
