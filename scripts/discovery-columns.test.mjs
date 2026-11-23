import assert from 'node:assert/strict';
import {test,after} from 'node:test';
import {createServer} from 'vite';
import * as native from '../public/filaman-native/color-search.js';
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,ws:false},optimizeDeps:{noDiscovery:true}});
after(()=>server.close());
const {readColumnFilters,matchesDiscoveryColumns}=await server.ssrLoadModule('/src/filaman/color-search.ts');
const base={kind:'inventory',name:'Pair',vendor:'Example',material:'PLA',colorHex:'#0000FF',multiColorHexes:['#0000FF','#FF000088'],colors:[{},{}],spools:[{location:'Desk',onHand:false},{location:'Shelf',onHand:true}]};
test('saved filters reject malformed, unknown, and wrong-mode values',()=>{
 for(const raw of ['no json','null','[]','{"color":{"type":"color","mode":"color"}}','{"name":{"type":"multi","values":["x"]}}'])assert.deepEqual(readColumnFilters(raw,'inventory',native),{});
 assert.deepEqual(readColumnFilters(JSON.stringify({vendor:{type:'multi',values:['Example']},unknown:{type:'text',operator:'contains',value:'x'}}),'catalog',native),{});
});
test('native color matching considers every color stop and transparency',()=>{
 const filter={type:'color',mode:'color',hueFrom:350,hueTo:10,saturationFrom:10,saturationTo:100,valueFrom:16,valueTo:100,valuePreview:100,includeTransparent:true};
 assert.equal(matchesDiscoveryColumns(base,{color:filter},native),true);
 assert.equal(matchesDiscoveryColumns(base,{color:{...filter,includeTransparent:false}},native),false);
});
test('location and on-hand stock must match the same spool',()=>{
 const scope={type:'multi',values:['on_hand_spools']};
 assert.equal(matchesDiscoveryColumns(base,{scope,location:{type:'multi',values:['Desk']}},native),false);
 assert.equal(matchesDiscoveryColumns(base,{scope,location:{type:'multi',values:['Shelf']}},native),true);
 assert.equal(matchesDiscoveryColumns({...base,spools:[]},{scope:{type:'multi',values:['filaments']}},native),true);
});
test('the native wheel supports complementary ranges and normalized persisted state',()=>{
 const filter={type:'color',mode:'color',harmony:'complementary',hueFrom:0,hueTo:10,saturationFrom:10,saturationTo:100,valueFrom:16,valueTo:100,valuePreview:100,includeTransparent:false};
 const restored=readColumnFilters(JSON.stringify({color:filter}),'catalog',native);
 assert.equal(matchesDiscoveryColumns({kind:'catalog',name:'Cyan',colors:[],colorHex:'#00FFFF'},restored,native),true);
 assert.equal(matchesDiscoveryColumns({kind:'catalog',name:'Blue',colors:[],colorHex:'#0000FF'},restored,native),false);
});

test('legacy and native stock/location constraints match one spool',()=>{
 const item={...base,spools:[{location:'Shelf',onHand:false},{location:'Desk',onHand:true}]};
 assert.equal(matchesDiscoveryColumns(item,{scope:{type:'multi',values:['on_hand_spools']}},native,{location:'Shelf',inventoryScope:'filaments'}),false);
 assert.equal(matchesDiscoveryColumns(item,{location:{type:'multi',values:['Shelf']}},native,{location:'all',inventoryScope:'on_hand_spools'}),false);
 assert.equal(matchesDiscoveryColumns(item,{scope:{type:'multi',values:['on_hand_spools']}},native,{location:'desk',inventoryScope:'filaments'}),true);
 assert.equal(matchesDiscoveryColumns(item,{},undefined,{location:'Shelf',inventoryScope:'on_hand_spools'}),false);
});
