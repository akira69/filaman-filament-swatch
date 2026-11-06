import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createServer} from 'vite';
test('money keeps currency, unknowns and locale; mixed project totals remain unknown',async()=>{
 const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,ws:false},optimizeDeps:{noDiscovery:true}});
 try{const f=await server.ssrLoadModule('/src/filaman/format.ts');const ctx={language:'fr',currency:'EUR',theme:'light'};
 assert.equal(f.formatMoney(0,'USD',ctx),new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(0));
 assert.equal(f.formatMoney(1,null,ctx),'—');assert.equal(f.formatMoney(null,'USD',ctx),'—');assert.equal(f.formatMoney(1,'not money',ctx),'—');
 for(const currency of ['JPY','KWD']) assert.equal(f.formatMoney(1234.56,currency,ctx),new Intl.NumberFormat('fr-FR',{style:'currency',currency}).format(1234.56));
 assert.deepEqual(f.projectMoney([{cost:20,costCurrency:'USD',spoolWeight:1000,estimatedWeight:250}]),{amount:5,currency:'USD'});
 assert.deepEqual(f.projectMoney([{cost:20,costCurrency:'USD',spoolWeight:1000,estimatedWeight:250},{cost:20,costCurrency:'EUR',spoolWeight:1000,estimatedWeight:250}]),{amount:null,currency:null});
 assert.deepEqual(f.projectMoney([{cost:20,spoolWeight:1000,estimatedWeight:250}]),{amount:null,currency:null});
 }finally{await server.close()}
});
test('an imported unlabelled job cost never acquires native currency or spool-price basis',async()=>{
 const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,ws:false},optimizeDeps:{noDiscovery:true}});
 try{const f=await server.ssrLoadModule('/src/filaman/format.ts');
 assert.deepEqual(f.importCost({price:null,priceCurrency:'USD',weight:1000},3,{currency:'EUR'}),{cost:3});
 assert.deepEqual(f.importCost({price:0,priceCurrency:'USD',weight:1000},3,{currency:'EUR'}),{cost:0,costCurrency:'USD',spoolWeight:1000});
 assert.equal(f.availableWeight([{onHand:true,remainingWeightG:0},{onHand:false,remainingWeightG:1000}]),0);
 assert.equal(f.availableWeight([{onHand:true,remainingWeightG:null}]),null);
 }finally{await server.close()}
});
