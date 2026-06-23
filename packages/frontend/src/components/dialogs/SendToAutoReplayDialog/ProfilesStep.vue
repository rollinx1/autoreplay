<script setup lang="ts">
import InputText from "primevue/inputtext";
import { computed, shallowRef } from "vue";

import type { ScanProfile } from "@/types";

const props = defineProps<{
  profiles: ScanProfile[];
}>();

const emit = defineEmits<{
  select: [profile: ScanProfile];
}>();

const search = shallowRef("");

const filteredProfiles = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (query === "") return props.profiles;

  return props.profiles.filter((profile) =>
    profile.name.toLowerCase().includes(query),
  );
});
</script>

<template>
  <section class="h-full flex flex-col">
    <header class="shrink-0 px-6 py-5 border-b border-surface-700">
      <h2 class="text-base font-semibold text-surface-100">Profiles</h2>
      <p class="mt-1 text-xs text-surface-400">
        Apply saved checks and resource settings to this scan
      </p>
    </header>

    <div
      v-if="profiles.length > 0"
      class="shrink-0 px-4 py-3 border-b border-surface-800"
    >
      <InputText
        v-model="search"
        placeholder="Search profiles..."
        size="small"
        class="w-full"
      />
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <button
        v-for="profile in filteredProfiles"
        :key="profile.id"
        type="button"
        class="w-full flex items-center gap-3 px-6 py-3 border-b border-surface-800 text-left hover:bg-surface-800"
        @click="emit('select', profile)"
      >
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-medium text-surface-200 truncate">
            {{ profile.name }}
          </span>
          <span class="block mt-1 text-xs text-surface-500">
            {{ profile.checkIds.length }} check{{
              profile.checkIds.length === 1 ? "" : "s"
            }}
            | {{ profile.threads }} threads | {{ profile.delayMs }} ms |
            {{ profile.timeoutSec }} s timeout
          </span>
        </span>
      </button>

      <div
        v-if="filteredProfiles.length === 0"
        class="h-full flex flex-col items-center justify-center gap-2 text-surface-500"
      >
        <i class="fas fa-layer-group text-xl" />
        <span class="text-xs">
          {{
            profiles.length === 0
              ? "No profiles available"
              : "No profiles found"
          }}
        </span>
      </div>
    </div>
  </section>
</template>
