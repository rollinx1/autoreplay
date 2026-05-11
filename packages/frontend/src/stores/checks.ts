import { defineStore } from "pinia";
import { ref } from "vue";

import type { CheckRule } from "@/types";

export const useCheckStore = defineStore("check", () => {
  // State
  const checks = ref<CheckRule[]>([]);

  // Actions
  const setChecks = (val: CheckRule[]) => {
    checks.value = val;
  };

  const addCheck = (val: CheckRule) => {
    checks.value = [...checks.value, val];
  };

  const updateCheck = (val: CheckRule) => {
    const idx = checks.value.findIndex((m) => m.id === val.id);
    if (idx >= 0) {
      const list = [...checks.value];
      list[idx] = val;
      checks.value = list;
    }
  };

  const removeCheck = (id: number) => {
    checks.value = checks.value.filter((m) => m.id !== id);
  };

  return {
    // State
    checks,
    // Actions
    setChecks,
    addCheck,
    updateCheck,
    removeCheck,
  };
});
