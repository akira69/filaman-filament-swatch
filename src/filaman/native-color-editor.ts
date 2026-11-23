// Keep the native Color Library dialog and its save/validation behavior unchanged.
export function openNativeColorEditor(onClose:()=>void,onError:()=>void):()=>void {
 const frame=document.createElement('iframe');frame.className='native-color-editor-frame';frame.title='FilaMan Color Library';frame.hidden=true;
 let timeout:ReturnType<typeof setTimeout>|undefined;
 let observer:MutationObserver|undefined;
 let closed=false;
 function cleanup(){if(closed)return;closed=true;clearTimeout(timeout);observer?.disconnect();frame.remove();}
 function fail(){cleanup();onError();}
 frame.addEventListener('load',()=>{
  const doc=frame.contentDocument;
  const dialog=doc?.getElementById('modal-container') as HTMLDialogElement|null;
  const opener=doc?.getElementById('btn-new');
  const form=doc?.getElementById('modal-form');
  if(!doc||!dialog||!opener||!form){fail();return;}
  // shortcut: native DOM IDs bridge the editor until FilaMan exposes a mount API.
  const style=doc.createElement('style');style.textContent='html,body{background:transparent!important}#fm-page{visibility:hidden!important}#modal-container{visibility:visible!important}';doc.head.append(style);
  dialog.addEventListener('close',()=>{cleanup();onClose();},{once:true});
  function open(){
   if(!form!.hasAttribute('data-dirty')||closed)return;
   opener!.click();
   if(!dialog!.open)return;
   observer?.disconnect();clearTimeout(timeout);frame.hidden=false;
   doc!.getElementById('color-name')?.focus();
  }
  observer=new MutationObserver(open);observer.observe(form,{attributes:true,attributeFilter:['data-dirty']});open();
 },{once:true});
 timeout=setTimeout(fail,15000);
 frame.src='/filaments/colors/';document.body.append(frame);
 return cleanup;
}
