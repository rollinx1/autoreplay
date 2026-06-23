<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Menu from "primevue/menu";
import { computed, ref, shallowRef } from "vue";

import { useProfiles } from "@/composables/useProfiles";
import { useProfileStore } from "@/stores";
import type { ScanProfile } from "@/types";

const { profiles, createDefaultProfile, deleteProfile } = useProfiles();
const profileStore = useProfileStore();
const search = shallowRef("");
const profileMenu = ref();
const menuProfileId = shallowRef<number | undefined>(undefined);

const filteredProfiles = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (query === "") return profiles.value;

  return profiles.value.filter((profile) =>
    profile.name.toLowerCase().includes(query),
  );
});

const selectProfile = (profile: ScanProfile) => {
  profileStore.selectProfile(profile.id);
};

const createProfile = async () => {
  await createDefaultProfile();
};

const menuItems = computed(() => [
  {
    label: "Delete Profile",
    icon: "fas fa-trash",
    command: async () => {
      const id = menuProfileId.value;
      if (id === undefined) return;

      const deleted = await deleteProfile(id);
      if (deleted) {
        profileStore.selectProfile(profileStore.profiles[0]?.id);
      }
    },
  },
]);

const showMenu = (event: Event, profileId: number) => {
  menuProfileId.value = profileId;
  profileMenu.value?.show({
    currentTarget: event.currentTarget,
    relatedTarget: event.target,
  });
};
</script>

<template>
  <Card class="h-full">
    <template #content>
      <div class="h-full flex flex-col">
        <div
          class="flex items-center gap-2 px-2 py-2 border-b border-surface-700"
        >
          <InputText
            v-model="search"
            placeholder="Search profiles..."
            size="small"
            class="flex-1"
          />
          <Button
            icon="fas fa-plus"
            label="New"
            size="small"
            @click="createProfile"
          />
        </div>

        <div class="px-4 py-1 border-b border-surface-700/30">
          <span class="text-xs text-surface-500">
            {{ filteredProfiles.length }} total
          </span>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto">
          <div
            v-for="profile in filteredProfiles"
            :key="profile.id"
            class="w-full flex items-stretch border-l-2"
            :class="{
              'bg-surface-700 border-secondary-400':
                profileStore.selectedProfileId === profile.id,
              'border-transparent':
                profileStore.selectedProfileId !== profile.id,
            }"
          >
            <button
              type="button"
              class="min-w-0 flex-1 px-3 py-2.5 text-left"
              @click="selectProfile(profile)"
            >
              <span class="block min-w-0">
                <span
                  class="block text-sm font-semibold text-surface-200 truncate"
                >
                  {{ profile.name }}
                </span>
                <span class="block mt-0.5 text-xs text-surface-500 truncate">
                  {{ profile.checkIds.length }} check{{
                    profile.checkIds.length === 1 ? "" : "s"
                  }}
                  | {{ profile.threads }} threads | {{ profile.delayMs }} ms
                </span>
              </span>
            </button>

            <div class="flex items-center pr-2">
              <Button
                icon="fas fa-ellipsis-h fa-xs"
                text
                severity="secondary"
                size="small"
                class="!w-5 !h-5 !p-0 text-surface-400 hover:text-surface-200"
                aria-label="Profile actions"
                title="Profile actions"
                @click.stop="showMenu($event, profile.id)"
              />
            </div>
          </div>

          <div
            v-if="filteredProfiles.length === 0"
            class="px-4 py-8 text-center text-surface-500 text-sm"
          >
            <i class="fas fa-layer-group text-2xl mb-2 opacity-50" />
            <p>No profiles found</p>
          </div>
        </div>

        <Menu
          ref="profileMenu"
          :model="menuItems"
          popup
          class="border border-surface-600 shadow-lg text-sm"
        />
      </div>
    </template>
  </Card>
</template>
