<script setup lang="ts">
import InputText from "primevue/inputtext";

const name = defineModel<string>("name", { required: true });
</script>

<template>
  <section class="h-full overflow-y-auto p-4">
    <div class="max-w-2xl">
      <div>
        <label
          for="profile-name"
          class="block text-sm font-medium text-surface-200"
        >
          Name
        </label>
        <p class="mt-1 text-xs text-surface-500">
          Display name used when selecting this profile
        </p>
        <InputText
          v-model="name"
          input-id="profile-name"
          class="w-full mt-3 text-sm"
        />
      </div>
    </div>
  </section>
</template>
