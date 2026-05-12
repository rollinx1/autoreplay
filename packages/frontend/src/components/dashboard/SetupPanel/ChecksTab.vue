<script setup lang="ts">
import Checkbox from "primevue/checkbox";
import { computed } from "vue";

import { useCheckStore, useSessionStore } from "@/stores";

const sessionStore = useSessionStore();
const checkStore = useCheckStore();

const sessionCheckIds = computed(() => sessionStore.currentSessionChecks);
const toggleSessionCheck = (checkId: number) => {
  const id = sessionStore.selectedSessionId;
  if (id === undefined) return;
  sessionStore.toggleSessionCheck(id, checkId);
};
</script>

<template>
  <div class="flex-1 min-h-0 overflow-y-auto px-3 py-2">
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
        <span class="text-xs text-surface-300 truncate" :title="m.name">
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
</template>
