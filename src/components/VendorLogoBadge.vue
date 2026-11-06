<script setup lang="ts">
import {ref,watch} from 'vue';
const props=defineProps<{vendorName:string;logoUrl?:string|null}>();
const failed=ref(false);watch(()=>props.logoUrl,()=>failed.value=false);
</script>
<template><span class="inline-flex items-center gap-2"><img v-if="logoUrl && !failed" :src="logoUrl" alt="" class="h-6 w-6 object-contain" @error="failed=true"/><span>{{ vendorName }}</span></span></template>
