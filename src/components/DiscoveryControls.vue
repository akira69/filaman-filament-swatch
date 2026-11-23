<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { GalleryHorizontal, LayoutGrid, Plus, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import ColorLibraryIcon from './ColorLibraryIcon.vue';
import ClearFilterIcon from './ClearFilterIcon.vue';
import { type DiscoveryFilters, type FilamentCard } from '@/composables/useFilaments';
import { filterKeys,loadNativeFilters,readColumnFilters,type NativeFilterModule,type ColumnFilter,type HeaderDefinition } from '@/filaman/color-search';
import { openNativeColorEditor } from '@/filaman/native-color-editor';
import type { DiscoveryMode } from '@/types/discovery';
const props=defineProps<{mode:DiscoveryMode;filters:DiscoveryFilters;items:FilamentCard[];viewMode:string;open:boolean;colorHost:HTMLElement|null;addColorHost:HTMLElement|null;active:boolean}>();
const emit=defineEmits<{(e:'toggleColor'):void;(e:'changeView',mode:'board'|'carousel'):void;(e:'clear'):void;(e:'catalogChanged'):void}>();
const {t,locale}=useI18n();
const table=ref<HTMLTableElement>();const portal=ref<HTMLElement>();
const ready=ref(false);const error=ref(false);const editorOpen=ref(false);
let module:NativeFilterModule|undefined,controller:ReturnType<NativeFilterModule['initHeaderColumnFilters']>|undefined,abort:AbortController|undefined,wheelPanel:HTMLElement|null=null,closeEditor:(()=>void)|undefined;
const keys=computed(()=>filterKeys(props.mode).filter(key=>key!=='color'));
const label=(key:string)=>key==='name'?t('filters.sortNameAsc'):key==='scope'?t('filters.inventoryScope'):t(`filters.${key}`);
const legacyFields={vendor:'vendor',material:'material',location:'location',scope:'inventoryScope',colorType:'colorType',color:'color'} as const;
const columns=()=>{
 const current=module?readColumnFilters(props.filters.columnFilters,props.mode,module):{};
 if(props.mode==='inventory')for(const key of ['vendor','material','location','scope','colorType'] as const){
  const value=props.filters[legacyFields[key]];
  if(!current[key]&&value!=='all'&&value!=='filaments'&&value!=='everything')current[key]={type:'multi',values:[value]};
 }
 return current;
};
function save(key:string,value:ColumnFilter){
 if(!module)return;const current=readColumnFilters(props.filters.columnFilters,props.mode,module);
 const legacy=legacyFields[key as keyof typeof legacyFields];if(legacy==='inventoryScope')props.filters.inventoryScope='filaments';else if(legacy)props.filters[legacy]='all';
 if(module.isColumnFilterActive(value))current[key]=value;else delete current[key];
 props.filters.columnFilters=Object.keys(current).length?JSON.stringify(current):'';
}
function sync(){
 if(!module||!controller||!table.value)return;
 const current=columns();
 for(const key of filterKeys(props.mode))controller.setValue(key,current[key]??module.emptyColumnFilter(key==='name'?'text':key==='color'?'color':'multi'));
 module.syncHeaderSortButtons(table.value,props.filters.sortField,props.filters.sortDir);
 for(const cell of table.value.querySelectorAll<HTMLElement>('th[data-sort]')){
  cell.classList.toggle('sort-asc',cell.dataset.sort===props.filters.sortField&&props.filters.sortDir==='asc');
  cell.classList.toggle('sort-desc',cell.dataset.sort===props.filters.sortField&&props.filters.sortDir==='desc');
 }
}
function options(key:string){
 if(key==='scope')return ['filaments','all_spools','on_hand_spools'].map(value=>({value,label:t(`filters.${{filaments:'filamentsOnly',all_spools:'allSpoolsOnly',on_hand_spools:'onHandSpoolsOnly'}[value]}`)}));
 if(key==='colorType')return ['single','multi'].map(value=>({value,label:t(`filters.${value==='single'?'singleColor':'multiColor'}`)}));
 const values=key==='color'?props.items.flatMap(item=>item.multiColorHexes??[item.colorHex]):props.items.flatMap(item=>key==='location'?item.locations??[]:item[key as 'vendor'|'material']??'');
 return [...new Set(values)].sort().map(value=>({value,label:value||t('discovery.unspecified'),...(key==='color'?{colorHexes:[value]}:{})}));
}
async function build(){
 if(!module||!table.value||!portal.value)return;
 abort?.abort();abort=new AbortController();module.setLang(locale.value);
 // Vue owns headings; native controls are rebuilt only when their inputs change.
 for(const wrap of table.value.querySelectorAll('.fm-header-filter-wrap'))wrap.remove();
 const current=columns();
 const definitions:HeaderDefinition[]=filterKeys(props.mode).map(key=>({key,label:key==='color'?t('detail.color'):label(key),columnSelector:key==='color'?'.native-color-anchor':`.col-${key}`,type:key==='name'?'text':key==='color'?'color':'multi',options:key==='name'?undefined:options(key),initialValue:current[key],onApply:value=>save(key,value)}));
 controller=module.initHeaderColumnFilters(table.value,definitions,abort.signal);
 for(const definition of definitions){
  const trigger=table.value.querySelector<HTMLElement>(`${definition.columnSelector} .fm-header-filter-trigger`);
  const panel=trigger&&document.getElementById(trigger.getAttribute('aria-controls')??'');
  if(!panel)continue;
  if(definition.key==='color'){
   wheelPanel=panel;panel.removeAttribute('role');panel.removeAttribute('aria-label');
   panel.remove();props.colorHost?.append(panel);
  }else portal.value.append(panel);
 }
 sync();
}
function sort(event:MouseEvent){
 if((event.target as HTMLElement).closest('.fm-header-filter-trigger'))return;
 const cell=(event.target as HTMLElement).closest<HTMLElement>('th[data-sort]');const key=cell?.dataset.sort;if(!key)return;
 props.filters.sortDir=props.filters.sortField===key&&props.filters.sortDir==='asc'?'desc':'asc';props.filters.sortField=key;sync();
}
async function load(){error.value=false;try{module=await loadNativeFilters();await nextTick();await build();ready.value=true;}catch{error.value=true;}}
function addColor(){
 if(editorOpen.value)return;editorOpen.value=true;if(ready.value)error.value=false;
 closeEditor=openNativeColorEditor(()=>{editorOpen.value=false;emit('catalogChanged');void nextTick(()=>document.querySelector<HTMLButtonElement>('[data-add-color]')?.focus());},()=>{editorOpen.value=false;error.value=true;});
}
watch(()=>props.colorHost,host=>{if(host&&wheelPanel){host.append(wheelPanel);sync();}});
const optionState=computed(()=>JSON.stringify(filterKeys(props.mode).filter(key=>key!=='name').map(key=>[key,options(key)])));
watch([()=>props.mode,optionState,locale],async()=>{await nextTick();await build();});
watch(()=>[props.filters.columnFilters,props.filters.vendor,props.filters.material,props.filters.location,props.filters.inventoryScope,props.filters.colorType,props.filters.sortField,props.filters.sortDir],sync);
onMounted(load);onBeforeUnmount(()=>{abort?.abort();closeEditor?.();});
</script>
<template>
 <div class="discovery-controls">
  <div class="discovery-view-modes"><Button v-for="view in ['carousel','board'] as const" :key="view" size="icon-sm" :variant="viewMode===view?'default':'ghost'" :data-view="view" :aria-pressed="viewMode===view" :aria-label="t(view==='board'?'actions.viewBoard':'actions.viewCarousel')" :title="t(`help.${view}`)" @click="emit('changeView',view)"><component :is="view==='board'?LayoutGrid:GalleryHorizontal" :size="17" aria-hidden="true"/></Button></div>
  <div class="discovery-header-scroll swatch-native-controls">
   <table ref="table" class="discovery-headers" :aria-label="t('guide.filterTitle')" @click="sort"><thead><tr>
    <th v-for="key in keys" :key="key" :class="`col-${key}`" :data-sort="key">{{label(key)}}</th>
    <th class="col-color" data-sort="hue">{{t('filters.sortHueAsc')}}</th>
    <th class="native-color-anchor" hidden/>
   </tr></thead></table>
  </div>
  <Button v-if="active" data-clear-filters variant="ghost" size="sm" :aria-label="t('actions.clearFilters')" :title="t('actions.clearFilters')" @click="emit('clear')"><ClearFilterIcon/><span class="clear-filter-label">{{t('actions.clearFilters')}}</span></Button>
  <button type="button" data-color-search class="color-search-button" :aria-expanded="open" aria-controls="color-search-input" :disabled="!ready" @click="emit('toggleColor')"><ColorLibraryIcon :size="19"/><span>{{t('discovery.colorSearch')}}</span><span v-if="columns().color || filters.color!=='all'" class="size-1.5 rounded-full bg-current"/><component :is="open?ChevronLeft:ChevronRight" :size="15" aria-hidden="true"/></button>
 </div>
 <p v-if="error" class="text-sm text-muted-foreground" role="alert">{{t('discovery.controlsUnavailable')}} <Button variant="ghost" size="sm" @click="ready?addColor():load()">{{t('app.retry')}}</Button></p>
 <Teleport v-if="addColorHost" :to="addColorHost"><Button v-if="mode==='catalog'" data-add-color variant="outline" size="sm" :aria-label="t('discovery.addColor')" :title="t('discovery.addColor')" :disabled="editorOpen" @click="addColor"><Plus :size="15" aria-hidden="true"/><span class="hidden sm:inline">{{t('discovery.addColor')}}</span></Button></Teleport>
 <Teleport to="body"><div ref="portal" class="swatch-native-controls"/></Teleport>
</template>
<style>
.discovery-controls{display:flex;align-items:center;flex-wrap:nowrap;gap:12px;border-bottom:1px solid var(--border);padding-bottom:12px;flex:none}
.discovery-header-scroll{flex:0 1 auto;min-width:0;overflow:auto;scrollbar-width:thin}
.discovery-headers{border-collapse:collapse;width:max-content;font-size:12px}
.discovery-headers th{padding:0 14px 0 0;line-height:14px;font-weight:600;white-space:nowrap;cursor:pointer;text-align:left}
.discovery-headers th:last-of-type{padding-right:0}.discovery-headers th[hidden]{display:none}
.discovery-headers .fm-header-filter-wrap{display:flex;margin-left:0}
.discovery-headers .fm-header-filter-wrap button{padding:2px}
.discovery-view-modes{display:flex;gap:3px;flex:none;margin-inline-end:20px}.discovery-controls>[data-clear-filters]{flex:none}.color-search-button{flex:none;margin-left:auto;}
.color-search-button{display:flex;align-items:center;gap:8px;min-height:36px;border:1px solid color-mix(in srgb,var(--primary) 55%,var(--border));border-radius:8px;background:color-mix(in srgb,var(--primary) 16%,var(--background));color:var(--foreground);padding:6px 11px;font-size:12px;font-weight:600;white-space:nowrap}
.color-search-button[aria-expanded=true]{background:color-mix(in srgb,var(--primary) 30%,var(--background))}.color-search-button:disabled{opacity:.4}.color-search-button:focus-visible{outline:2px solid var(--ring);outline-offset:2px}
@media(max-width:700px){.discovery-view-modes{margin-inline-end:0}.discovery-controls{gap:8px;flex-wrap:wrap}.discovery-header-scroll{order:5;flex-basis:100%}.discovery-controls .clear-filter-label{display:none}.color-search-button{gap:6px;padding:6px 9px}}
</style>
