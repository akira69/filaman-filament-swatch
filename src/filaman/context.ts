import { reactive } from 'vue';
import { loadNativeSettings } from '../api/filaman';
export type HostContext = {language:'en'|'de'|'fr'; currency:string|null; theme:string;userId?:number|null};
export const hostContext = reactive<HostContext>({language:'en',currency:null,theme:'brand',userId:null});
export function startHostContext() {
  let stopped=false,sequence=0,languageRevision=0;
  const controller=new AbortController();
  const parentRoot=window.parent.document.documentElement;
  const syncTheme=()=>{
    hostContext.theme=parentRoot.dataset.theme || localStorage.getItem('theme') || 'brand';
    document.documentElement.dataset.theme=hostContext.theme;
    document.documentElement.classList.toggle('dark',hostContext.theme!=='light');
  };
  const refresh=async()=>{
    const current=++sequence,revision=languageRevision;
    const settings=await loadNativeSettings(controller.signal);
    if(stopped||current!==sequence)return;
    if(revision===languageRevision)hostContext.language=settings.language==='de'||settings.language==='fr'?settings.language:'en';
    hostContext.userId=settings.userId;hostContext.currency=settings.currency || null;syncTheme();
  };
  const background=()=>void refresh().catch(error=>{if(!stopped)console.error('Could not refresh FilaMan presentation',error);});
  const visible=()=>{if(document.visibilityState==='visible')background();};
  const restored=(event:PageTransitionEvent)=>{if(event.persisted)background();};
  const observer=new MutationObserver(records=>{
    syncTheme();if(records.some(r=>r.attributeName==='lang')) {
      languageRevision++;const language=parentRoot.lang;
      hostContext.language=language==='fr'||language==='de'?language:'en';
    }
  });
  if(parentRoot !== document.documentElement)observer.observe(parentRoot,{attributes:true,attributeFilter:['lang','data-theme']});
  window.addEventListener('focus',background);window.addEventListener('storage',background);window.addEventListener('pageshow',restored);
  document.addEventListener('visibilitychange',visible);
  window.parent.addEventListener('focus',background);window.parent.document.addEventListener('visibilitychange',visible);
  syncTheme();
  return {context:hostContext,ready:refresh(),stop(){
    stopped=true;controller.abort();observer.disconnect();
    window.removeEventListener('focus',background);window.removeEventListener('storage',background);window.removeEventListener('pageshow',restored);
    document.removeEventListener('visibilitychange',visible);window.parent.removeEventListener('focus',background);window.parent.document.removeEventListener('visibilitychange',visible);
  }};
}
