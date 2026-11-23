// Refresh the intentional browser-vendor assets from an audited FilaMan checkout.
import {mkdtemp,readFile,writeFile,mkdir,rm,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
import postcss from 'postcss';
const root=process.argv[2]&&resolve(process.argv[2]);
if(!root)throw Error('Usage: node scripts/vendor-filaman-color-search.mjs /path/to/filaman-system');
const source=join(root,'frontend/src');
const directory=await realpath(await mkdtemp(join(tmpdir(),'swatch-native-')));
const output=resolve('public/filaman-native');
try {
 const dictionaries={};
 for(const lang of ['en','de','fr']){
  const dict=JSON.parse(await readFile(join(source,`i18n/${lang}.json`),'utf8'));
  dictionaries[lang]={filters:dict.filters,filaments:{color:dict.filaments.color,colors:dict.filaments.colors}};
 }
 const adapter=join(directory,'i18n.js');
 await writeFile(adapter,`const dictionaries=${JSON.stringify(dictionaries)};let lang='en';export function setLang(value){lang=value in dictionaries?value:'en'};export function t(key,vars={}){const resolve=dict=>key.split('.').reduce((v,k)=>v?.[k],dict);let text=resolve(dictionaries[lang])??resolve(dictionaries.en)??key;for(const [key,value]of Object.entries(vars))text=text.replaceAll('{'+key+'}',String(value));return text}`);
 const entry=join(directory,'entry.js');
 const native=join(source,'lib/table-column-filters.ts');
 await writeFile(entry,`export {initHeaderColumnFilters,syncHeaderSortButtons,matchesColumnFilter,isColumnFilterActive,sanitizeColumnFilters,emptyColumnFilter} from ${JSON.stringify(native)};export {setLang} from ${JSON.stringify(adapter)};`);
 await mkdir(output,{recursive:true});
 await build({configFile:false,publicDir:false,logLevel:'error',plugins:[{
  name:'native-color-controls',enforce:'pre',resolveId(id,importer){if(id==='./i18n'&&importer?.startsWith(source))return adapter;},
  transform(code,id){if(id===native)return code
   .replace('const showHarmony = isColorGridState(state)',"const showHarmony = isColorGridState(state) || state.def.type === 'color'")
   .replace("if (!state.panel.classList.contains('open') || state.colorDisclosure", "if (!state.panel.classList.contains('open') && !state.panel.closest('.swatch-color-panel') || state.colorDisclosure");}
 }],build:{outDir:output,emptyOutDir:false,minify:true,lib:{entry,formats:['es'],fileName:()=> 'color-search.js'}}});
 const global=postcss.parse(await readFile(join(source,'styles/global.css'),'utf8'));
 global.walkAtRules(rule=>{if(rule.name==='import')rule.remove();});
 global.walkRules(rule=>{
  const selectors=rule.selectors.filter(s=>/^(?:fm-(?:header-(?:filter|color|sort|lock)|color-(?!editor)|btn|input|select|sr-only)|sort-(?:asc|desc))/.test(s.match(/\.([\w-]+)/)?.[1]??'')&&!s.includes('body'));
  if(!selectors.length)rule.remove();else rule.selector=selectors.map(s=>`:where(.swatch-native-controls) ${s}`).join(',');
 });
 global.walkAtRules(rule=>{if(!rule.nodes?.length)rule.remove();});
 global.walkComments(comment=>comment.remove());
 const wheel=postcss.parse(await readFile(join(source,'styles/color-wheel.css'),'utf8'));
 wheel.walkRules(rule=>{rule.selector=rule.selectors.map(s=>`:where(.swatch-native-controls) ${s}`).join(',');});
 await writeFile(join(output,'color-search.css'),global.toString()+'\n'+wheel.toString()+'\n.swatch-native-controls [hidden],.swatch-native-controls .hidden{display:none!important}\n');
 await writeFile(join(output,'LICENSE.txt'),await readFile(join(root,'LICENSE.md')));
 await writeFile(join(output,'provenance.json'),JSON.stringify({repository:'https://github.com/Fire-Devils/filaman-system',commit:execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),source:'frontend/src/lib/table-column-filters.ts',sha256:createHash('sha256').update(await readFile(native)).digest('hex'),adaptations:['Subset native translations; locale setter does not change the host document.','Expose existing harmony controls and markers for the inline color panel.','Scope native styles to Swatch controls.'],refresh:'node scripts/vendor-filaman-color-search.mjs /path/to/filaman-system'},null,2)+'\n');
}finally{await rm(directory,{recursive:true,force:true});}
