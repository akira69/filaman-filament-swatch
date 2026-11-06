import assert from 'node:assert/strict';import {test} from 'node:test';import {createServer} from 'vite';import {fileURLToPath} from 'node:url';
import {createSSRApp} from 'vue';import {renderToString} from 'vue/server-renderer';import {createI18n} from 'vue-i18n';import {readFile} from 'node:fs/promises';
test('import chooser uses English/German/French locale rather than German literals',async()=>{
 const server=await createServer({configFile:false,plugins:[(await import('@vitejs/plugin-vue')).default()],server:{middlewareMode:true,hmr:false,ws:false},optimizeDeps:{noDiscovery:true},resolve:{alias:{'@':fileURLToPath(new URL('../src',import.meta.url))}}});
 try{const {default:component}=await server.ssrLoadModule('/src/components/FilamentCombobox.vue');
 for(const [locale,label] of [['en','Search filaments'],['de','Filamente suchen'],['fr','Rechercher un filament']]){const messages=JSON.parse(await readFile(new URL(`../src/locales/${locale}.json`,import.meta.url),'utf8'));const app=createSSRApp(component,{filaments:[]});app.use(createI18n({legacy:false,locale,messages:{[locale]:messages}}));assert.match(await renderToString(app),new RegExp(label));}
 }finally{await server.close();}
});
