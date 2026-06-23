<script setup lang="ts">
import { ButtonGroup } from "@caido-utils/ui-components";
import InputNumber from "primevue/inputnumber";
import { computed } from "vue";

const threads = defineModel<number>("threads", { required: true });
const delayMs = defineModel<number>("delayMs", { required: true });
const timeoutSec = defineModel<number>("timeoutSec", { required: true });

const profiles = [
  { label: "Fast", value: "fast", threads: 10, delayMs: 0, timeoutSec: 30 },
  { label: "Medium", value: "medium", threads: 5, delayMs: 0, timeoutSec: 30 },
  { label: "Slow", value: "slow", threads: 1, delayMs: 1000, timeoutSec: 30 },
];

const profileOptions = profiles.map(({ label, value }) => ({ label, value }));

const activeProfile = computed({
  get: () =>
    profiles.find(
      (profile) =>
        profile.threads === threads.value &&
        profile.delayMs === delayMs.value &&
        profile.timeoutSec === timeoutSec.value,
    )?.value ?? "custom",
  set: (value: string) => {
    const profile = profiles.find((item) => item.value === value);
    if (profile === undefined) return;

    threads.value = profile.threads;
    delayMs.value = profile.delayMs;
    timeoutSec.value = profile.timeoutSec;
  },
});
</script>

<template>
  <section class="h-full flex flex-col">
    <header class="shrink-0 px-6 py-5 border-b border-surface-700">
      <h2 class="text-base font-semibold text-surface-100">Resource pool</h2>
      <p class="mt-1 text-xs text-surface-400">
        Control scan concurrency, pacing, and request timeout
      </p>
    </header>

    <div class="flex-1 min-h-0 overflow-y-auto px-6 py-4">
      <div
        class="flex flex-col items-start gap-2 pb-4 border-b border-surface-800"
      >
        <span class="text-sm font-medium text-surface-200">Scan profile</span>
        <ButtonGroup v-model="activeProfile" :options="profileOptions" />
      </div>

      <div
        class="grid grid-cols-2 gap-4 items-center py-4 border-b border-surface-800"
      >
        <div>
          <label
            for="scan-threads"
            class="block text-sm font-medium text-surface-200"
          >
            Threads
          </label>
          <p class="mt-1 text-xs text-surface-500">
            Maximum number of active request workers
          </p>
        </div>
        <InputNumber
          v-model="threads"
          input-id="scan-threads"
          :min="1"
          :max="50"
          size="small"
          class="justify-self-end"
          input-class="w-32"
        />
      </div>

      <div
        class="grid grid-cols-2 gap-4 items-center py-4 border-b border-surface-800"
      >
        <div>
          <label
            for="scan-delay"
            class="block text-sm font-medium text-surface-200"
          >
            Delay (ms)
          </label>
          <p class="mt-1 text-xs text-surface-500">
            Minimum time between replay request starts
          </p>
        </div>
        <InputNumber
          v-model="delayMs"
          input-id="scan-delay"
          :min="0"
          size="small"
          class="justify-self-end"
          input-class="w-32"
        />
      </div>

      <div class="grid grid-cols-2 gap-4 items-center py-4">
        <div>
          <label
            for="scan-timeout"
            class="block text-sm font-medium text-surface-200"
          >
            Timeout (s)
          </label>
          <p class="mt-1 text-xs text-surface-500">
            Maximum time allowed for each replay request
          </p>
        </div>
        <InputNumber
          v-model="timeoutSec"
          input-id="scan-timeout"
          :min="1"
          size="small"
          class="justify-self-end"
          input-class="w-32"
        />
      </div>
    </div>
  </section>
</template>
