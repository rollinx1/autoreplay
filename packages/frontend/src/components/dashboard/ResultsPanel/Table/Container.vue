<script setup lang="ts">
import {
  Card as CardContainer,
  DataTable,
  HttpqlInput,
} from "@caido-utils/ui-components";
import Button from "primevue/button";
import { computed } from "vue";

import { useTable } from "./useTable";

import { useScan } from "@/composables/useScan";
import { useSessionStore } from "@/stores";
import type { ScanResult } from "@/types";

const { activeRow, filterText, items, columns, handleRowClick } = useTable();
const sessionStore = useSessionStore();
const { pauseScan, resumeScan, stopScan } = useScan();

const scanState = computed(() => sessionStore.currentSessionSetup.scanState);
const isRunning = computed(() => scanState.value === "running");
const isPaused = computed(() => scanState.value === "paused");
const isActive = computed(() => isRunning.value || isPaused.value);

const onPause = () => {
  const id = sessionStore.selectedSessionId;
  if (id === undefined) return;
  void pauseScan(id);
};

const onResume = () => {
  const id = sessionStore.selectedSessionId;
  if (id === undefined) return;
  void resumeScan(id);
};

const onStop = () => {
  const id = sessionStore.selectedSessionId;
  if (id === undefined) return;
  void stopScan(id);
};

type RowData = { id: number; _original: ScanResult };

const onRowClick = (event: { data: Record<string, unknown> }) => {
  handleRowClick(event as { data: RowData });
};
</script>

<template>
  <CardContainer class="h-full overflow-hidden">
    <template #content>
      <div class="h-full flex flex-col min-h-0">
        <div class="px-3 py-2 border-b border-surface-700 shrink-0 flex gap-2">
          <HttpqlInput
            v-model="filterText"
            placeholder="Filter requests..."
            class="flex-1"
          />
          <Button
            v-if="isRunning"
            icon="fas fa-pause"
            size="small"
            @click="onPause"
          />
          <Button
            v-if="isPaused"
            icon="fas fa-play"
            size="small"
            @click="onResume"
          />
          <Button
            v-if="isActive"
            icon="fas fa-stop"
            size="small"
            @click="onStop"
          />
        </div>
        <div class="flex-1 min-h-0">
          <DataTable
            v-model:active-row="activeRow"
            :items="items"
            :columns="columns"
            data-key="id"
            scroll-key="results-table"
            :row-height="30"
            @row-click="onRowClick"
          >
            <template #cell-method="{ item }">
              <span class="text-xs">
                {{ item.method }}
              </span>
            </template>

            <template #cell-path="{ item }">
              <span class="truncate block" :title="item.path">
                {{ item.path }}
              </span>
            </template>

            <template #cell-host="{ item }">
              <span
                class="text-xs text-surface-400 truncate block"
                :title="item.host"
              >
                {{ item.host }}
              </span>
            </template>

            <template #cell-query="{ item }">
              <span
                class="text-xs text-surface-400 truncate block"
                :title="item.query"
              >
                {{ item.query || "—" }}
              </span>
            </template>

            <template #cell-statusCode="{ item }">
              <span
                v-if="item.statusCode"
                class="px-1.5 py-0.5 rounded text-xs font-semibold"
                :class="
                  item.statusCode >= 200 && item.statusCode < 300
                    ? 'bg-green-900/50 text-green-300'
                    : item.statusCode >= 300 && item.statusCode < 400
                      ? 'bg-yellow-900/50 text-yellow-300'
                      : item.statusCode >= 400
                        ? 'bg-red-900/50 text-red-300'
                        : 'bg-surface-700 text-surface-300'
                "
              >
                {{ item.statusCode }}
              </span>
              <span v-else class="text-xs text-surface-500">—</span>
            </template>

            <template #cell-size="{ item }">
              <span class="text-xs text-surface-300">
                {{
                  item.size > 1024
                    ? (item.size / 1024).toFixed(1) + "K"
                    : item.size
                }}
              </span>
            </template>

            <template #cell-duration="{ item }">
              <span class="text-xs text-surface-300">
                {{ item.duration }}ms
              </span>
            </template>

            <template #cell-timestamp="{ item }">
              <span class="text-xs text-surface-400">
                {{ new Date(item.timestamp).toLocaleTimeString() }}
              </span>
            </template>
          </DataTable>
        </div>
      </div>
    </template>
  </CardContainer>
</template>
