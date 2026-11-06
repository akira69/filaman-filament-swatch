import { hostContext, type HostContext } from './context';
import type {ProjectFilament} from '../types/project';
const locales={en:'en-US',de:'de-DE',fr:'fr-FR'};
export function formatMoney(amount:number|null|undefined, amountCurrency:string|null|undefined, context:HostContext=hostContext):string {
  if(amount==null || !Number.isFinite(amount) || !amountCurrency || !/^[A-Z]{3}$/.test(amountCurrency))return '—';
  try{return new Intl.NumberFormat(locales[context.language],{style:'currency',currency:amountCurrency}).format(amount);}catch{return '—';}
}
export const formatNumber=(amount:number,maximumFractionDigits=2)=>new Intl.NumberFormat(locales[hostContext.language],{maximumFractionDigits}).format(amount);
export const formatDate=(value:string)=>new Intl.DateTimeFormat(locales[hostContext.language],{dateStyle:'medium'}).format(new Date(value));
export function projectMoney(items:Partial<ProjectFilament>[]):{amount:number|null;currency:string|null} {
  let currency:string|null=null;let amount=0;
  for(const item of items){
    if(item.cost==null || !Number.isFinite(item.cost) || !item.costCurrency || !item.spoolWeight || item.spoolWeight<=0)return {amount:null,currency:null};
    if(currency && currency!==item.costCurrency)return {amount:null,currency:null};
    currency=item.costCurrency;amount+=item.cost/item.spoolWeight*(item.actualWeight??item.estimatedWeight??0);
  }
  return {amount:currency?amount:null,currency};
}
export function formatProjectMoney(items:Partial<ProjectFilament>[]):string {const total=projectMoney(items);return formatMoney(total.amount,total.currency);}
export function importCost(item: {price?:number|null;priceCurrency?:string|null;weight?:number|null}|null, fileCost:number|undefined, context:Pick<HostContext,'currency'>=hostContext):Partial<ProjectFilament> {
  if(item?.price != null)return {cost:item.price,costCurrency:item.priceCurrency??context.currency??undefined,spoolWeight:item.weight??undefined};
  return {cost:fileCost};
}
export function availableWeight(spools:{onHand:boolean;remainingWeightG:number|null}[]):number|null {
  const available=spools.filter(s=>s.onHand);
  return available.some(s=>s.remainingWeightG===null)?null:available.reduce((sum,s)=>sum+(s.remainingWeightG??0),0);
}
