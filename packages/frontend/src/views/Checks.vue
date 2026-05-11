<script setup lang="ts">
import { ref, watch } from "vue";

import CheckDetail from "@/components/checks/CheckDetail/Container.vue";
import CheckList from "@/components/checks/CheckList/Container.vue";
import { useCheckStore } from "@/stores";
import type { CheckRule } from "@/types";

const selected = ref<CheckRule | undefined>(undefined);
const checkStore = useCheckStore();

watch(
  () => checkStore.checks,
  () => {
    if (
      selected.value !== undefined &&
      !checkStore.checks.some((c) => c.id === selected.value?.id)
    ) {
      selected.value = undefined;
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="h-full grid grid-cols-12 grid-rows-1 gap-1">
    <div class="col-span-4 h-full min-h-0">
      <CheckList v-model="selected" />
    </div>
    <div class="col-span-8 h-full min-h-0">
      <CheckDetail v-model="selected" />
    </div>
  </div>
</template>
