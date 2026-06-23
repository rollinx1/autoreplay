<script setup lang="ts">
import { onMounted } from "vue";

import ProfileDetail from "@/components/profiles/ProfileDetail/Container.vue";
import ProfileList from "@/components/profiles/ProfileList/Container.vue";
import { useProfiles } from "@/composables/useProfiles";

const { fetchProfiles } = useProfiles();

onMounted(() => {
  void fetchProfiles();
});
</script>

<template>
  <div class="h-full grid grid-cols-12 grid-rows-1 gap-1">
    <div class="col-span-4 h-full min-h-0">
      <ProfileList />
    </div>
    <div class="col-span-8 h-full min-h-0">
      <ProfileDetail />
    </div>
  </div>
</template>
