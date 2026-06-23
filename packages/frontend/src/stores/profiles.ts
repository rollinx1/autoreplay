import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { ScanProfile } from "@/types";

type ProfileDraft = {
  name?: string;
  checkIds?: number[];
  threads?: number;
  delayMs?: number;
  timeoutSec?: number;
};

export const useProfileStore = defineStore("profile", () => {
  const profiles = ref<ScanProfile[]>([]);
  const selectedProfileId = ref<number | undefined>(undefined);
  const drafts = ref<Record<number, ProfileDraft>>({});

  const selectedProfile = computed(() =>
    profiles.value.find((profile) => profile.id === selectedProfileId.value),
  );

  const setProfiles = (value: ScanProfile[]) => {
    profiles.value = value;
  };

  const addProfile = (value: ScanProfile) => {
    profiles.value = [...profiles.value, value];
  };

  const updateProfile = (value: ScanProfile) => {
    const index = profiles.value.findIndex(
      (profile) => profile.id === value.id,
    );
    if (index < 0) {
      profiles.value = [...profiles.value, value];
      return;
    }

    const next = [...profiles.value];
    next[index] = value;
    profiles.value = next;
  };

  const removeProfile = (id: number) => {
    profiles.value = profiles.value.filter((profile) => profile.id !== id);
    if (selectedProfileId.value === id) {
      selectedProfileId.value = undefined;
    }
    const nextDrafts = { ...drafts.value };
    delete nextDrafts[id];
    drafts.value = nextDrafts;
  };

  const selectProfile = (id: number | undefined) => {
    selectedProfileId.value = id;
  };

  const setDraft = (id: number, patch: Partial<ProfileDraft>) => {
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
    profiles,
    selectedProfileId,
    drafts,
    selectedProfile,
    setProfiles,
    addProfile,
    updateProfile,
    removeProfile,
    selectProfile,
    setDraft,
    clearDraft,
  };
});
