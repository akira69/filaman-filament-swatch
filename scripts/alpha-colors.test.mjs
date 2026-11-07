import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createServer} from 'vite';
test('RGBA normalization preserves zero opacity and leaves RGB ranking unchanged', async()=>{
 const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,ws:false},optimizeDeps:{noDiscovery:true}});
 try {
  const c=await server.ssrLoadModule('/src/lib/colorUtils.ts');
  assert.deepEqual(c.normalizeColor('#F008'),{hex:'#FF000088',rgbHex:'#FF0000',alpha:136/255});
  assert.deepEqual(c.normalizeColor('#FF000000'),{hex:'#FF000000',rgbHex:'#FF0000',alpha:0});
  assert.equal(c.normalizeColor('#FF0000').alpha,1);
  assert.equal(c.normalizeColor('url(javascript:evil)'),null);
  assert.equal(c.normalizeColor('#GGGGGG'),null);
  assert.equal(c.colorDistance('#F008','#FF000000'),0);
  assert.equal(c.getHue('#F008'),0);
  assert.equal(c.averageColor(['#B15821','#FFBB00']),'#D88A11');
  assert.equal(c.averageColor(['#FF000000','#00FF00']),'#80800080');
  assert.equal(c.averageColor(['invalid']),null);
 }finally{await server.close()}
});
