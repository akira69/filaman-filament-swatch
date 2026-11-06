import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
test('mode failures are isolated; per-mode filters, cached catalog and history survive',async()=>{
 const url=new URL('http://test/app/swatch?filaman_hosted=1');const handlers={};
 globalThis.window={location:url,addEventListener:(k,f)=>handlers[k]=f,history:{replaceState:(_,__,next)=>url.href=new URL(next,url).href,pushState:(_,__,next)=>url.href=new URL(next,url).href}};
 const f=JSON.parse(await readFile(new URL('./fixtures/filaman/contracts.json',import.meta.url),'utf8'));let deny=true;let calls=0;
 globalThis.fetch=async(path)=>{const u=new URL(path,url); if(deny&&u.pathname==='/api/v1/filaments')return new Response('',{status:403});if(u.pathname==='/api/v1/colors')calls++;const data=f[u.pathname];return new Response(JSON.stringify(Array.isArray(data)?data:data[u.searchParams.get('page')||'1']));};
 const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,ws:false},optimizeDeps:{noDiscovery:true},resolve:{alias:{'@':fileURLToPath(new URL('../src',import.meta.url))}}});
 try{const {useFilaments}=await server.ssrLoadModule('/src/composables/useFilaments.ts');const s=useFilaments();
 await s.refresh();assert.match(s.error.value,/403/);await s.setDiscoveryMode('catalog');assert.equal(s.filtered.value.length,3);assert.equal(s.error.value,null);
 s.filters.search='Transparent';await new Promise(setImmediate);assert.equal(s.filtered.value.length,1);
 deny=false;await s.setDiscoveryMode('inventory');assert.equal(s.filtered.value.length,3);s.filters.material='PETG';await new Promise(setImmediate);assert.equal(s.filtered.value.length,1);
 await s.setDiscoveryMode('catalog');assert.equal(s.filters.search,'Transparent');assert.equal(s.filtered.value[0].id,'color:17');assert.equal(calls,2);
 url.searchParams.set('mode','inventory');url.searchParams.set('m','PETG');url.searchParams.delete('q');handlers.popstate();await new Promise(setImmediate);assert.equal(s.mode.value,'inventory');assert.equal(s.filters.material,'PETG');
 deny=true;await s.refresh();assert.equal(s.inventoryItems.value.length,0);assert.ok(s.cachedItems.value.every(i=>i.kind==='catalog'));
 }finally{await server.close();delete globalThis.window;}
});
