<script setup lang="ts">
/* eslint-disable vue/no-v-html */

defineProps<{
  html: string;
}>();
</script>

<template>
  <code class="hljs" v-html="html" />
</template>
