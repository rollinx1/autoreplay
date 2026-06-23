<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import Button from "primevue/button";
import { computed, shallowRef } from "vue";

import ChecksPanel from "./ChecksPanel.vue";
import GeneralPanel from "./GeneralPanel.vue";
import ResourcesPanel from "./ResourcesPanel.vue";

import { useProfiles } from "@/composables/useProfiles";
import { useCheckStore, useProfileStore } from "@/stores";

const profileStore = useProfileStore();
const checkStore = useCheckStore();
const { updateProfile, deleteProfile } = useProfiles();

type ProfileSection = "general" | "checks" | "resources";

const activeSection = shallowRef<ProfileSection>("general");
const sections: {
  label: string;
  value: ProfileSection;
  icon: string;
}[] = [
  { label: "General", value: "general", icon: "fas fa-gear" },
  { label: "Checks", value: "checks", icon: "fas fa-flask" },
  { label: "Resources", value: "resources", icon: "fas fa-sliders" },
];

const profile = computed(() => profileStore.selectedProfile);
const draft = computed(() => {
  if (profile.value === undefined) return undefined;
  return profileStore.drafts[profile.value.id];
});

const editName = computed({
  get: () => draft.value?.name ?? profile.value?.name ?? "",
  set: (value) => {
    if (profile.value === undefined) return;
    profileStore.setDraft(profile.value.id, { name: value });
  },
});

const editCheckIds = computed(
  () => draft.value?.checkIds ?? profile.value?.checkIds ?? [],
);

const editThreads = computed({
  get: () => draft.value?.threads ?? profile.value?.threads ?? 5,
  set: (value) => {
    if (profile.value === undefined) return;
    profileStore.setDraft(profile.value.id, { threads: value });
  },
});

const editDelayMs = computed({
  get: () => draft.value?.delayMs ?? profile.value?.delayMs ?? 0,
  set: (value) => {
    if (profile.value === undefined) return;
    profileStore.setDraft(profile.value.id, { delayMs: value });
  },
});

const editTimeoutSec = computed({
  get: () => draft.value?.timeoutSec ?? profile.value?.timeoutSec ?? 30,
  set: (value) => {
    if (profile.value === undefined) return;
    profileStore.setDraft(profile.value.id, { timeoutSec: value });
  },
});

const canSave = computed(
  () =>
    editName.value.trim() !== "" &&
    editThreads.value >= 1 &&
    editDelayMs.value >= 0 &&
    editTimeoutSec.value >= 1,
);

const toggleCheck = (checkId: number) => {
  if (profile.value === undefined) return;
  const next = editCheckIds.value.includes(checkId)
    ? editCheckIds.value.filter((id) => id !== checkId)
    : [...editCheckIds.value, checkId];
  profileStore.setDraft(profile.value.id, { checkIds: next });
};

const saveProfile = async () => {
  if (profile.value === undefined || !canSave.value) return;

  const updated = await updateProfile(profile.value.id, {
    name: editName.value.trim(),
    checkIds: [...editCheckIds.value],
    threads: editThreads.value,
    delayMs: editDelayMs.value,
    timeoutSec: editTimeoutSec.value,
  });

  if (updated !== undefined) {
    profileStore.clearDraft(updated.id);
  }
};

const removeProfile = async () => {
  if (profile.value === undefined) return;
  const deleted = await deleteProfile(profile.value.id);
  if (deleted) {
    profileStore.selectProfile(profileStore.profiles[0]?.id);
  }
};
</script>

<template>
  <Card class="h-full">
    <template #content>
      <div v-if="profile" class="h-full flex flex-col min-h-0">
        <header class="shrink-0">
          <div
            class="flex items-center justify-between gap-3 px-4 py-3 border-b border-surface-800"
          >
            <div class="min-w-0">
              <h2 class="text-base font-bold text-surface-100 truncate">
                {{ editName || profile.name }}
              </h2>
              <p class="mt-0.5 text-xs text-surface-500">
                {{ editCheckIds.length }} check{{
                  editCheckIds.length === 1 ? "" : "s"
                }}
                | {{ editThreads }} threads | {{ editDelayMs }} ms
              </p>
            </div>
            <div class="flex items-center gap-1">
              <Button
                icon="fas fa-trash"
                severity="danger"
                size="small"
                text
                aria-label="Delete profile"
                title="Delete profile"
                @click="removeProfile"
              />
              <Button
                icon="fas fa-save"
                label="Save"
                size="small"
                :disabled="!canSave"
                @click="saveProfile"
              />
            </div>
          </div>
          <nav
            class="flex items-center px-2 border-b border-surface-700"
            aria-label="Profile settings"
          >
            <button
              v-for="section in sections"
              :key="section.value"
              class="flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2"
              :class="
                activeSection === section.value
                  ? 'text-secondary-400 border-secondary-400'
                  : 'text-surface-500 border-transparent hover:text-surface-300'
              "
              type="button"
              @click="activeSection = section.value"
            >
              <i :class="section.icon" />
              <span>{{ section.label }}</span>
            </button>
          </nav>
        </header>

        <div class="flex-1 min-h-0 overflow-hidden">
          <GeneralPanel
            v-if="activeSection === 'general'"
            v-model:name="editName"
          />
          <ChecksPanel
            v-else-if="activeSection === 'checks'"
            :checks="checkStore.checks"
            :selected-check-ids="editCheckIds"
            @toggle="toggleCheck"
          />
          <ResourcesPanel
            v-else
            v-model:threads="editThreads"
            v-model:delay-ms="editDelayMs"
            v-model:timeout-sec="editTimeoutSec"
          />
        </div>
      </div>

      <div
        v-else
        class="h-full flex flex-col items-center justify-center text-surface-500"
      >
        <i class="fas fa-arrow-left text-3xl mb-3 opacity-50" />
        <p class="text-sm">No profile selected</p>
        <p class="text-xs mt-1">Select a profile from the list</p>
      </div>
    </template>
  </Card>
</template>
