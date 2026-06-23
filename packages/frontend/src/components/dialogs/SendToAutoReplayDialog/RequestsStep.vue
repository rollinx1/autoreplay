<script setup lang="ts">
import Button from "primevue/button";

import type { HttpRequest } from "@/types";

defineProps<{
  requests: HttpRequest[];
  loading: boolean;
  error: string | undefined;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <section class="h-full flex flex-col">
    <header class="shrink-0 px-6 py-5 border-b border-surface-700">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-surface-100">
            Selected requests
          </h2>
          <p class="mt-1 text-xs text-surface-400">
            Requests included in this scan
          </p>
        </div>
        <span class="text-xs text-surface-500">
          {{ requests.length }} selected
        </span>
      </div>
    </header>

    <div class="flex-1 min-h-0 overflow-auto">
      <div
        class="grid grid-cols-12 gap-1 px-4 py-2 border-b border-surface-700 bg-surface-800 text-xs font-medium text-surface-500"
      >
        <span class="col-span-2">Method</span>
        <span class="col-span-4">Host</span>
        <span class="col-span-6">Path</span>
      </div>

      <div
        v-for="request in requests"
        :key="request.id"
        class="grid grid-cols-12 gap-1 px-4 py-2 border-b border-surface-800 text-xs"
      >
        <span class="col-span-2 font-medium text-surface-200">
          {{ request.method }}
        </span>
        <span
          class="col-span-4 truncate text-surface-300"
          :title="request.host"
        >
          {{ request.host }}
        </span>
        <span
          class="col-span-6 truncate font-mono text-surface-400"
          :title="request.path"
        >
          {{ request.path }}
        </span>
      </div>

      <div
        v-if="loading"
        class="h-full flex flex-col items-center justify-center gap-2 text-surface-500"
      >
        <i class="fas fa-spinner fa-spin text-xl" />
        <span class="text-xs">Loading requests</span>
      </div>

      <div
        v-else-if="error !== undefined"
        class="h-full flex flex-col items-center justify-center gap-3 px-6 text-center"
      >
        <i class="fas fa-triangle-exclamation text-xl text-red-400" />
        <span class="text-sm text-surface-300">{{ error }}</span>
        <Button
          label="Retry"
          icon="fas fa-rotate-right"
          severity="secondary"
          size="small"
          outlined
          @click="emit('retry')"
        />
      </div>
    </div>
  </section>
</template>
