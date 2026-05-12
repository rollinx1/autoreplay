<script setup lang="ts">
import CheckDetail from "@/components/checks/CheckDetail/Container.vue";
import CheckList from "@/components/checks/CheckList/Container.vue";
</script>

<template>
  <div class="h-full grid grid-cols-12 grid-rows-1 gap-1">
    <div class="col-span-4 h-full min-h-0">
      <CheckList />
    </div>
    <div class="col-span-8 h-full min-h-0">
      <CheckDetail />
    </div>
  </div>
</template>
