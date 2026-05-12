<script setup lang="ts">
import Button from "primevue/button";
import { computed } from "vue";

import { useScan } from "@/composables/useScan";
import { useCheckStore, useSessionStore } from "@/stores";

const sessionStore = useSessionStore();
const checkStore = useCheckStore();
const { launchScan } = useScan();

const sessionId = computed(() => sessionStore.selectedSessionId);
const requestCount = computed(
  () => sessionStore.currentSessionSetup.requests.length,
);
const sessionCheckIds = computed(() => sessionStore.currentSessionChecks);
const activeCheckCount = computed(() => sessionCheckIds.value.length);
const scanState = computed(() => sessionStore.currentSessionSetup.scanState);
const isScanning = computed(
  () => scanState.value === "running" || scanState.value === "paused",
);
const canLaunch = computed(
  () =>
    requestCount.value > 0 && activeCheckCount.value > 0 && !isScanning.value,
);

const onLaunch = async () => {
  if (!canLaunch.value) return;
  const id = sessionId.value;
  if (id === undefined) return;

  const requestIds = sessionStore.currentSessionSetup.requests.map((r) => r.id);
  const checks = checkStore.checks.filter((c) =>
    sessionCheckIds.value.includes(c.id),
  );
  const { threads, delayMs, timeoutSec } = sessionStore.currentSessionSetup;

  await launchScan(id, requestIds, checks, {
    threads,
    delayMs,
    timeoutSec,
  });
};
</script>

<template>
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
