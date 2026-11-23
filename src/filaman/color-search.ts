import { shallowRef } from 'vue';
import type { DiscoveryFilters, FilamentCard } from '@/composables/useFilaments';
import type { DiscoveryMode } from '@/types/discovery';
export type ColumnFilter = {type:'multi';values:string[]} | {type:'text';operator:string;value:string} | {
  type:'color';mode:string;harmony?:string;hueFrom:number;hueTo:number;saturationFrom:number;saturationTo:number;
  valueFrom:number;valueTo:number;valuePreview:number;includeTransparent:boolean;
};
export type ColumnFilters=Record<string,ColumnFilter>;
export type HeaderDefinition={key:string;label:string;columnSelector:string;type:ColumnFilter['type'];options?:{value:string;label:string;colorHexes?:string[]}[];initialValue?:ColumnFilter;onApply:(value:ColumnFilter)=>void};
export type NativeFilterModule={
  initHeaderColumnFilters:(table:HTMLTableElement,definitions:HeaderDefinition[],signal:AbortSignal)=>{setValue:(key:string,value:ColumnFilter)=>void;getValue:(key:string)=>ColumnFilter;resetAll:()=>void};
  syncHeaderSortButtons:(table:HTMLTableElement,key:string|null,direction:string)=>void;
  matchesColumnFilter:(value:unknown,filter:ColumnFilter|undefined)=>boolean;
  isColumnFilterActive:(filter:ColumnFilter|undefined)=>boolean;
  sanitizeColumnFilters:(value:unknown,definitions:{key:string;type:string}[])=>ColumnFilters;
  emptyColumnFilter:(type:ColumnFilter['type'])=>ColumnFilter;
  setLang:(locale:string)=>void;
};
export const nativeFilters=shallowRef<NativeFilterModule>();
let pending:Promise<NativeFilterModule>|undefined;
export function loadNativeFilters():Promise<NativeFilterModule>{
 return pending??=(async()=>{
  const base=import.meta.env.BASE_URL;
  const module=await import(/* @vite-ignore */ `${base}filaman-native/color-search.js`) as NativeFilterModule;
  const link=document.createElement('link');link.rel='stylesheet';link.href=`${base}filaman-native/color-search.css`;
  await new Promise<void>((resolve,reject)=>{link.onload=()=>resolve();link.onerror=()=>{link.remove();reject(Error('Native color controls unavailable'));};document.head.append(link);});
  nativeFilters.value=module;return module;
 })().catch(error=>{pending=undefined;throw error;});
}
export function filterKeys(mode:DiscoveryMode){return mode==='inventory'?['name','vendor','material','location','scope','colorType','color']:['name','color'];}
export function readColumnFilters(raw:string,mode:DiscoveryMode,module:NativeFilterModule):ColumnFilters{
 try{return module.sanitizeColumnFilters(JSON.parse(raw||'{}'),filterKeys(mode).map(key=>({key,type:key==='name'?'text':key==='color'?'color':'multi'})));}catch{return {};}
}
export function matchesDiscoveryColumns(item:FilamentCard,columns:ColumnFilters,module:NativeFilterModule|undefined,legacy?:Pick<DiscoveryFilters,'location'|'inventoryScope'>):boolean{
 const matches=module?.matchesColumnFilter??(()=>true);
 if(!matches(item.name,columns.name)||!matches(item.multiColorHexes??[item.colorHex],columns.color))return false;
 if(item.kind==='catalog')return true;
 if(!matches(item.vendor,columns.vendor)||!matches(item.material,columns.material)||!matches(item.colors.length>1?'multi':'single',columns.colorType))return false;
 const scope=columns.scope?.type==='multi'?columns.scope.values:[];
 const restrictSpools=scope.length>0&&!scope.includes('filaments');
 const location=legacy?.location??'all';
 const inventoryScope=legacy?.inventoryScope??'filaments';
 if(module?.isColumnFilterActive(columns.location)||restrictSpools||location!=='all'||['all_spools','on_hand_spools'].includes(inventoryScope)){
  return !!item.spools?.some(spool=>matches(spool.location,columns.location)
   &&(location==='all'||spool.location?.toLowerCase()===location.toLowerCase())
   &&(inventoryScope!=='on_hand_spools'||spool.onHand)
   &&(!restrictSpools||scope.includes('all_spools')||scope.includes('on_hand_spools')&&spool.onHand));
 }
 return true;
}
