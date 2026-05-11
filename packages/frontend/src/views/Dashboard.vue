<script setup lang="ts">
import { Card as CardContainer } from "@caido-utils/ui-components";

import ResultsPanel from "@/components/dashboard/ResultsPanel/Container.vue";
import SessionList from "@/components/dashboard/SessionList/SessionList.vue";
import SetupPanel from "@/components/dashboard/SetupPanel/Container.vue";
import { useSessionStore } from "@/stores";

const sessionStore = useSessionStore();
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex-1 grid grid-cols-12 gap-1 overflow-hidden auto-rows-fr">
      <div class="col-span-3 h-full">
        <SessionList />
      </div>
      <div class="col-span-9 h-full">
        <SetupPanel
          v-if="sessionStore.selectedSession?.status === 'setup'"
          class="h-full"
        />
        <ResultsPanel
          v-else-if="sessionStore.selectedSession?.status === 'results'"
          class="h-full"
        />

        <CardContainer v-else class="h-full">
          <template #content>
            <div
              class="h-full flex flex-col items-center justify-center text-surface-500"
            >
              <i class="fas fa-arrow-left text-3xl mb-3 opacity-50" />
              <p class="text-sm">No session selected</p>
              <p class="text-xs mt-1">Select a session from the sidebar</p>
            </div>
          </template>
        </CardContainer>
      </div>
    </div>
  </div>
</template>
