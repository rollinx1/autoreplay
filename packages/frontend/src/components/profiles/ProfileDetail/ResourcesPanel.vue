<script setup lang="ts">
import InputNumber from "primevue/inputnumber";

const threads = defineModel<number>("threads", { required: true });
const delayMs = defineModel<number>("delayMs", { required: true });
const timeoutSec = defineModel<number>("timeoutSec", { required: true });
</script>

<template>
  <section class="h-full flex flex-col min-h-0">
    <div class="flex-1 min-h-0 overflow-y-auto px-4 py-2">
      <div
        class="grid grid-cols-2 gap-4 items-center py-4 border-b border-surface-800"
      >
        <div>
          <label
            for="profile-threads"
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
          input-id="profile-threads"
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
            for="profile-delay"
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
          input-id="profile-delay"
          :min="0"
          size="small"
          class="justify-self-end"
          input-class="w-32"
        />
      </div>

      <div class="grid grid-cols-2 gap-4 items-center py-4">
        <div>
          <label
            for="profile-timeout"
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
          input-id="profile-timeout"
          :min="1"
          size="small"
          class="justify-self-end"
          input-class="w-32"
        />
      </div>
    </div>
  </section>
</template>
