<script setup lang="ts">
import {ref,watch,onMounted} from 'vue';
import {useI18n} from 'vue-i18n';
import type {NativeSpoolSummary} from '@/types/discovery';
import {loadSpoolRenderer,renderNativeSpool,type SpoolRenderer} from '@/filaman/spool-visuals';
import {formatNumber} from '@/filaman/format';
const props=defineProps<{spool:NativeSpoolSummary;colors:string[];colorStyle:'striped'|'gradient'}>();
const {t}=useI18n();const svg=ref<string|null>(null);let renderer:SpoolRenderer|null=null;
const render=()=>{svg.value=renderer?renderNativeSpool(renderer,props.spool.remainingPercent,props.colors,props.colorStyle,`swatch-spool-${props.spool.id}`):null;};
watch(()=>[props.spool,props.colors,props.colorStyle],render,{deep:true});
onMounted(async()=>{try{renderer=await loadSpoolRenderer();render();}catch{svg.value=null;}});
</script>
<template>
 <span v-if="svg" class="half-reel" role="img" :aria-label="`${formatNumber(spool.remainingPercent!)}%`"><span v-html="svg" /></span>
 <span v-else class="text-xs">{{ spool.remainingPercent === null ? t('discovery.unknown') : `${formatNumber(spool.remainingPercent)}%` }}</span>
</template>
<style scoped>
.half-reel {display:inline-block;width:54px;height:96px;overflow:hidden;flex-shrink:0;}
.half-reel>span {display:block;width:108px;height:96px;}
.half-reel :deep(svg) {width:108px;height:96px;}
</style>
