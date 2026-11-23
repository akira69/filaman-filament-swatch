<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { X } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ClearFilterIcon from './ClearFilterIcon.vue';
import type { DiscoveryFilters } from '@/composables/useFilaments';
const props=defineProps<{open:boolean;filters:DiscoveryFilters;count:string;mode:string;active:boolean}>();
const emit=defineEmits<{(e:'close'):void;(e:'clear'):void;(e:'host',host:HTMLElement|null):void}>();
const {t}=useI18n();
const mobile=useMediaQuery('(max-width: 700px)');
const search=ref<HTMLInputElement>();
function setHost(element:unknown){emit('host',element as HTMLElement|null);}
function closeOnEscape(event:KeyboardEvent){if(event.key==='Escape'){event.preventDefault();event.stopPropagation();emit('close');}}
function focusSearch(event:Event){event.preventDefault();void nextTick(()=>search.value?.focus());}
</script>
<template>
 <Dialog :open="open" :modal="mobile" @update:open="!$event&&emit('close')">
  <DialogContent placement="side" :inline="!mobile" :show-close-button="false" :aria-describedby="undefined"
   class="swatch-color-sidebar flex flex-col overflow-hidden border bg-background p-0 shadow-lg"
   @keydown.capture="closeOnEscape" @open-auto-focus="focusSearch" @close-auto-focus="event=>{event.preventDefault();emit('close');}"
   @interact-outside="event=>{if(!mobile)event.preventDefault();}" @focus-outside="event=>{if(!mobile)event.preventDefault();}">
   <header class="flex items-start justify-between gap-3 border-b px-4 py-4">
    <div><DialogTitle>{{t('discovery.colorSearch')}}</DialogTitle><p class="mt-1 text-xs text-muted-foreground">{{t('discovery.colorSearchHint')}}</p></div>
    <Button variant="ghost" size="icon-sm" :aria-label="t('actions.close')" @click="emit('close')"><X :size="17" aria-hidden="true"/></Button>
   </header>
   <div class="min-h-0 flex-1 overflow-y-auto p-4">
    <label class="mb-2 block text-xs font-medium" for="color-search-input">{{t(mode==='catalog'?'discovery.searchColors':'search.label')}}</label>
    <input id="color-search-input" ref="search" v-model="filters.search" class="mb-5 w-full rounded-md border bg-background px-3 py-2 text-sm" :placeholder="t(mode==='catalog'?'discovery.colorSearchPlaceholder':'search.label')"/>
    <div v-if="filters.color!=='all'" class="mb-3 flex items-center justify-between gap-2 text-xs"><span>{{t('detail.color')}}: {{filters.color}}</span><Button variant="ghost" size="icon-sm" :aria-label="t('actions.clearFilters')" @click="filters.color='all'"><X :size="14" aria-hidden="true"/></Button></div>
    <div :ref="setHost" class="swatch-native-controls swatch-color-panel"/>
   </div>
   <footer class="flex items-center justify-between gap-2 border-t px-4 py-2 text-xs"><span>{{count}}</span><Button v-if="active" variant="ghost" size="sm" @click="emit('clear')"><ClearFilterIcon/>{{t('actions.clearFilters')}}</Button></footer>
  </DialogContent>
 </Dialog>
</template>
<style>
.swatch-color-sidebar{width:336px;flex-shrink:0;max-height:100%;border-radius:12px}
.swatch-color-panel .fm-header-filter-panel{display:block!important;position:static!important;inset:auto!important;width:100%;min-width:0;max-height:none;padding:0;overflow:visible;border:0;box-shadow:none;background:transparent}
.swatch-color-panel .fm-header-color-title,.swatch-color-panel .fm-header-filter-actions{display:none}
.swatch-color-panel .fm-header-color-modes{grid-template-columns:repeat(4,minmax(0,1fr))}
.swatch-color-panel .fm-header-color-default{grid-column:auto}
.swatch-color-panel .fm-header-color-neutral-swatch{flex-shrink:0}
.swatch-native-controls{--bg-elevated:var(--popover);--bg-soft:var(--muted);--text:var(--foreground);--text-muted:var(--muted-foreground);--accent:var(--primary);--accent-3:var(--primary);--focus-ring:var(--ring)}
.swatch-native-controls .fm-header-filter-panel{max-width:calc(100vw - 16px);z-index:60}
.native-color-editor-frame{position:fixed;inset:0;width:100%;height:100%;border:0;background:transparent;z-index:1000}
.native-color-editor-frame[hidden]{display:none}
@media(min-width:701px){.swatch-color-sidebar{height:100%;align-self:stretch;box-shadow:none}}
@media(max-width:700px){.swatch-color-sidebar{width:min(360px,100vw);height:100dvh;border-radius:12px 0 0 12px}}
</style>
