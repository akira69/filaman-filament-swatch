import { reactive } from 'vue';
import { normalizeColor, hexToRgbString } from '../lib/colorUtils';
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
    if(parentRoot!==document.documentElement){
      const host=getComputedStyle(parentRoot),style=document.documentElement.style;
      // Keep upstream RGB-channel callers while the host owns the actual palette.
      for(const [target,source] of Object.entries({'background-rgb':'bg',surface:'bg-elevated','surface-alt':'bg-soft',text:'text','text-muted':'text-muted','accent-rgb':'accent','accent-2':'accent-2'})){
        const color=normalizeColor(host.getPropertyValue(`--${source}`));
        if(color)style.setProperty(`--${target}`,hexToRgbString(color.hex));else style.removeProperty(`--${target}`);
      }
      for(const token of ['border','btn-primary-text','font-sans','font-serif','radius-md','shadow-sm']){
        const value=host.getPropertyValue(`--${token}`).trim(),target=token==='border'?'--filaman-border':`--${token}`;
        if(value)style.setProperty(target,value);else style.removeProperty(target);
      }
    }
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
  if(parentRoot !== document.documentElement)observer.observe(parentRoot,{attributes:true,attributeFilter:['lang','data-theme','style']});
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
