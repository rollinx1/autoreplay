<script setup lang="ts">
import InputNumber from "primevue/inputnumber";
import { computed } from "vue";

import { useSessionStore } from "@/stores";

const sessionStore = useSessionStore();
const sessionId = computed(() => sessionStore.selectedSessionId);

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
</script>

<template>
  <div class="flex flex-col gap-3 px-3 py-2">
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
      <InputNumber v-model="delayMs" :min="0" size="small" input-class="w-32" />
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
</template>
