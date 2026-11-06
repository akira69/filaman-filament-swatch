import assert from 'node:assert/strict';import {test} from 'node:test';import {createServer} from 'vite';
test('shared reel uses native fill and ordered alpha colors, with explicit unknown fallback',async()=>{
 const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,ws:false},optimizeDeps:{noDiscovery:true}});
 try{const {renderNativeSpool}=await server.ssrLoadModule('/src/filaman/spool-visuals.ts');const calls=[];const renderer={renderSpoolReel:(...args)=>{calls.push(args);return '<svg id="reel"><use href="#reel"/></svg>'}};
 for(const value of [0,25,50,100]) assert.match(renderNativeSpool(renderer,value,['#FF000000','#FF000088'],'striped','s17'),/s17-reel/);
 assert.deepEqual(calls.map(c=>c[0]),[0,.25,.5,1]);assert.deepEqual(calls[0].slice(1),[['#FF000000','#FF000088'],'striped',{view:'quarter'}]);
 assert.equal(renderNativeSpool(renderer,null,['#fff'],'gradient','s18'),null);assert.equal(calls.length,4);
 }finally{await server.close()}
});
