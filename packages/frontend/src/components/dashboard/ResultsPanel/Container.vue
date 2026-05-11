<script setup lang="ts">
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";

import Editors from "./Editors/Container.vue";
import Table from "./Table/Container.vue";
</script>

<template>
  <div class="flex flex-col h-full gap-1 overflow-hidden">
    <div class="flex-1 min-h-0 overflow-hidden">
      <Splitter
        class="h-full"
        layout="vertical"
        :pt="{
          root: { style: 'border: none' },
          gutter: { class: 'border-none bg-surface-950 cursor-row-resize' },
          panel: { style: 'border: none' },
        }"
      >
        <SplitterPanel :size="50" :min-size="10" class="overflow-hidden">
          <Table />
        </SplitterPanel>
        <SplitterPanel :size="50" :min-size="10" class="overflow-hidden">
          <Editors />
        </SplitterPanel>
      </Splitter>
    </div>
  </div>
</template>
