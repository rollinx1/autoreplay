<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { ref } from "vue";

import ChecksTab from "./ChecksTab.vue";
import RequestPanel from "./RequestPanel.vue";
import SettingsTab from "./SettingsTab.vue";
import SetupHeader from "./SetupHeader.vue";

const rightTab = ref<"checks" | "settings">("checks");
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <!-- Header -->
    <Card class="shrink-0">
      <template #content>
        <SetupHeader />
      </template>
    </Card>

    <!-- Main area -->
    <div class="flex-1 min-h-0 overflow-hidden">
      <Splitter
        class="h-full"
        layout="horizontal"
        :pt="{
          root: { style: 'border: none' },
          gutter: { class: 'border-none bg-surface-950 cursor-col-resize' },
          panel: { style: 'border: none' },
        }"
      >
        <!-- Left: Table + Preview -->
        <SplitterPanel :size="67" :min-size="40" class="overflow-hidden">
          <RequestPanel />
        </SplitterPanel>

        <!-- Right: Checks + Settings -->
        <SplitterPanel :size="33" :min-size="20" class="overflow-hidden">
          <Card class="h-full flex flex-col">
            <template #content>
              <div class="h-full flex flex-col">
                <!-- Tabs -->
                <div class="flex border-b border-surface-700 shrink-0">
                  <button
                    class="px-4 py-3 text-sm font-semibold"
                    :class="
                      rightTab === 'checks'
                        ? 'text-secondary-400 border-b-2 border-secondary-400'
                        : 'text-surface-500 hover:text-surface-300'
                    "
                    @click="rightTab = 'checks'"
                  >
                    Checks
                  </button>
                  <button
                    class="px-4 py-3 text-sm font-semibold"
                    :class="
                      rightTab === 'settings'
                        ? 'text-secondary-400 border-b-2 border-secondary-400'
                        : 'text-surface-500 hover:text-surface-300'
                    "
                    @click="rightTab = 'settings'"
                  >
                    Settings
                  </button>
                </div>

                <ChecksTab v-if="rightTab === 'checks'" />
                <SettingsTab v-if="rightTab === 'settings'" />
              </div>
            </template>
          </Card>
        </SplitterPanel>
      </Splitter>
    </div>
  </div>
</template>
