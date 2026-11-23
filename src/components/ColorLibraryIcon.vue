<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 18 });
</script>

<template>
  <span aria-hidden="true" class="color-library-icon" :style="{ width: `${size}px`, height: `${size}px` }" />
</template>

<style scoped>
/* Match FilaMan’s Color Library navigation icon. */
.color-library-icon { display: inline-block; flex: none; border-radius: 50%; background: conic-gradient(#ef6163, #f4b648, #a8ce57, #4dd1bd, #558cf1, #d877be, #ef6163); }
</style>
