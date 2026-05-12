import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { CheckRule } from "@/types";

type CheckDraft = {
  name?: string;
  description?: string;
  code?: string;
};

export const useCheckStore = defineStore("check", () => {
  // State
  const checks = ref<CheckRule[]>([]);
  const selectedCheckId = ref<number | undefined>(undefined);
  const drafts = ref<Record<number, CheckDraft>>({});

  // Getters
  const selectedCheck = computed(() =>
    checks.value.find((c) => c.id === selectedCheckId.value),
  );

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
    if (selectedCheckId.value === id) {
      selectedCheckId.value = undefined;
    }
    const next = { ...drafts.value };
    delete next[id];
    drafts.value = next;
  };

  const selectCheck = (id: number | undefined) => {
    selectedCheckId.value = id;
  };

  const setDraft = (id: number, patch: Partial<CheckDraft>) => {
    drafts.value = {
      ...drafts.value,
      [id]: { ...drafts.value[id], ...patch },
    };
  };

  const clearDraft = (id: number) => {
    const next = { ...drafts.value };
    delete next[id];
    drafts.value = next;
  };

  return {
    // State
    checks,
    selectedCheckId,
    selectedCheck,
    drafts,
    // Actions
    setChecks,
    addCheck,
    updateCheck,
    removeCheck,
    selectCheck,
    setDraft,
    clearDraft,
  };
});
