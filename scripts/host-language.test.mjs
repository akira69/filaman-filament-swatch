import 'vue';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {createServer} from 'vite';

// A later focus refresh must not replace the host's rendered language with an older profile value.
test('embedded language follows FilaMan after setting changes and later profile refreshes', async () => {
  const previous = Object.fromEntries(['window','document','MutationObserver','fetch','getComputedStyle','localStorage'].map(key => [key, globalThis[key]]));
  const events = {};
  let observer;
  const parentRoot = {lang:'en', dataset:{theme:'brand'}};
  globalThis.document = {documentElement:{dataset:{},classList:{toggle(){}},style:{setProperty(){},removeProperty(){}}}, addEventListener(){}, removeEventListener(){}};
  globalThis.window = {parent:{document:{documentElement:parentRoot,addEventListener(){},removeEventListener(){}},addEventListener(){},removeEventListener(){}},addEventListener:(name,callback)=>events[name]=callback,removeEventListener(){}};
  globalThis.localStorage = {getItem(){return null}};
  globalThis.getComputedStyle = () => ({getPropertyValue(){return ''}});
  globalThis.MutationObserver = class {constructor(callback){observer=callback}observe(){}disconnect(){}};
  globalThis.fetch = async path => new Response(JSON.stringify(path === '/api/v1/me' ? {id:1,language:'en'} : {currency:'EUR'}));
  const server = await createServer({configFile:false, server:{middlewareMode:true,hmr:false,ws:false},optimizeDeps:{noDiscovery:true}});
  let host;
  try {
    const {startHostContext} = await server.ssrLoadModule('/src/filaman/context.ts');
    host = startHostContext();
    await host.ready;
    for (const language of ['de','fr','en']) {
      parentRoot.lang = language;
      observer([{attributeName:'lang'}]);
      assert.equal(host.context.language, language);
      events.focus();
      await new Promise(setImmediate);
      assert.equal(host.context.language, language, 'focus must preserve the current FilaMan setting');
    }
  } finally {host?.stop();await server.close();Object.assign(globalThis,previous);}
});

const catalogs = Object.fromEntries(await Promise.all(['en','de','fr'].map(async language => [language,JSON.parse(await readFile(new URL(`../src/locales/${language}.json`,import.meta.url),'utf8'))])));
for (const language of ['en','de','fr']) test(`${language}: visible palette, release and guide text has native translations`, () => {
  const dict = catalogs[language];
  for (const [section,keys] of Object.entries({actions:['clearPalette','pin','unpin','copy','menu'],info:['count','legend'],changelog:['title','released','gotIt','viewOnGithub'],guide:['title','description','browseTitle','browse','filterTitle','filter','viewsTitle','views','detailsTitle','details','harmoniesTitle','harmonies','paletteTitle','palette','similar','complementary','analogous','triadic','split-complementary']})) {
    for (const key of keys) assert.ok(typeof dict[section]?.[key] === 'string' && dict[section][key].length, `${language}: ${section}.${key}`);
  }
});

// User-facing terminology follows FilaMan; the persisted API mode remains `catalog`.
test('Color library labels and guide describe all registered colors', () => {
  assert.equal(catalogs.en.discovery.catalog, 'Color library');
  assert.equal(catalogs.de.discovery.catalog, 'Farbbibliothek');
  assert.equal(catalogs.fr.discovery.catalog, 'Bibliothèque de couleurs');
  assert.match(catalogs.en.guide.browse, /all colors registered in FilaMan’s Color Library/);
  assert.match(catalogs.en.guide.browse, /no filament assigned/);
});
