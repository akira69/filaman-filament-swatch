import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {before,after,test} from 'node:test';
import puppeteer from 'puppeteer';
const origin='http://swatch.test',base='/plugins/filament-swatch/';
const fixture=JSON.parse(await readFile(new URL('./fixtures/filaman/contracts.json',import.meta.url),'utf8'));
let browser;before(async()=>{browser=await puppeteer.launch({headless:true,args:process.env.CI?['--no-sandbox']:[]});});after(async()=>await browser?.close());
async function open(options={}){
 const context=await browser.createBrowserContext();const page=await context.newPage();await page.setViewport({width:1400,height:900});
 const requests=[],errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.evaluateOnNewDocument(()=>{localStorage.setItem('spoolman-url','/old-server');localStorage.setItem('locale','de');});
 await page.setRequestInterception(true);
 page.on('request',async request=>{
  const u=new URL(request.url());requests.push(u.href);const respond=(value,status=200)=>request.respond({status,contentType:'application/json',body:JSON.stringify(value)});
  if(u.origin!==origin){if(process.env.CAPTURE_SWATCH && /(?:iconify\.design|googleapis\.com|gstatic\.com)$/.test(u.hostname))return request.continue();return respond([]);}
  if(u.pathname==='/shell')return request.respond({contentType:'text/html',body:`<html lang="en" data-theme="brand"><body><iframe src="${base}app/swatch?filaman_hosted=1&filaman_hosted_config=${base}hosted-config&mode=catalog"></iframe></body></html>`});
  if(u.pathname===base+'hosted-config')return respond(options.badConfig?{}:{contract_version:2,mode:'hosted',app_key:'filaman',api_base_path:'/api/v1',app_base_path:base.slice(0,-1)},options.configStatus||200);
  if(u.pathname==='/login')return request.respond({contentType:'text/html',body:'<h1>Sign in</h1>'});
  if(u.pathname==='/api/v1/me')return respond({id:1,language:options.language||'en'},options.expireSettings?401:200);
  if(u.pathname==='/api/v1/app-settings/public-info')return respond({currency:options.currency||'EUR'});
  if(u.pathname.startsWith('/api/v1/')){
   if(options.denyInventory && u.pathname==='/api/v1/filaments')return respond({},403);
   if(u.pathname.includes('/manufacturers/'))return request.respond({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="red"/></svg>'});
   const value=fixture[u.pathname];if(value)return respond(Array.isArray(value)?value:value[u.searchParams.get('page')||'1']);
   return respond({},404);
  }
  if(u.pathname==='/real-spool-reel.js'&&process.env.SHARED_REEL_FILE)return request.respond({contentType:'application/javascript',body:await readFile(process.env.SHARED_REEL_FILE,'utf8')});
  if(u.pathname==='/spool-reel.js'&&process.env.SHARED_REEL_FILE)return request.respond({contentType:'application/javascript',body:"import{renderSpoolReel as real}from'/real-spool-reel.js';export function renderSpoolReel(...args){window.__reelCalls??=[];window.__reelCalls.push(args);return real(...args)}"});
  if(u.pathname==='/spool-reel.js')return request.respond({contentType:'application/javascript',body:'export function renderSpoolReel(f,c,s,o){window.__reelCalls??=[];window.__reelCalls.push([f,c,s,o]);return `<svg id="reel" viewBox="0 0 100 100"><rect width="100" height="100" fill="red"/></svg>`}'});
  const path=u.pathname.slice(base.length);let body;try{body=await readFile(new URL((process.env.SWATCH_DIST || '../dist/')+path,import.meta.url));}catch{body=await readFile(new URL((process.env.SWATCH_DIST || '../dist/')+'index.html',import.meta.url));}
  await request.respond({contentType:({js:'application/javascript',css:'text/css',svg:'image/svg+xml'})[path.split('.').pop()]||'text/html',body});
 });
 await page.goto(options.parent?`${origin}/shell`:`${origin}${base}app/swatch?filaman_hosted=1&filaman_hosted_config=${encodeURIComponent(base+'hosted-config')}${options.query||''}`,{waitUntil:'networkidle0'});
 return {page,requests,errors,close:()=>context.close()};
}
async function click(page,label){assert.ok(await page.evaluate(label=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===label);e?.click();return !!e;},label),`missing button ${label}`);}
test('native inventory, search, filter modal, catalog and navigation',async()=>{
 const {page,requests,errors,close}=await open();try{
 await page.waitForFunction(()=>document.querySelectorAll('.card-name').length===3);
 if(process.env.CAPTURE_SWATCH)await page.screenshot({path:process.env.CAPTURE_SWATCH+'/inventory.png',fullPage:true});
 await page.type('nav input[type=text]','Blue');await page.waitForFunction(()=>document.querySelectorAll('.card-name').length===1);
 await page.reload({waitUntil:'networkidle0'});assert.equal(await page.$eval('nav input[type=text]',e=>e.value),'Blue');
 await page.$eval('nav input[type=text]',e=>{e.value='';e.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.waitForFunction(()=>document.querySelectorAll('.card-name').length===3);
 await page.click('button[title="Filters"]');await page.waitForSelector('input[name=material][value=PETG]');await page.click('input[name=material][value=PETG]');await click(page,'Save');
 await page.waitForFunction(()=>document.querySelectorAll('.card-name').length===1);
 await page.click('button[title="Filters"]');await click(page,'Reset');await click(page,'Save');await page.waitForFunction(()=>document.querySelectorAll('.card-name').length===3);
 await click(page,'Color catalog');await page.waitForFunction(()=>document.body.innerText.includes('Transparent'));
 if(process.env.CAPTURE_SWATCH)await page.screenshot({path:process.env.CAPTURE_SWATCH+'/catalog.png',fullPage:true});
 assert.equal(await page.$('.card-sub'),null);assert.equal(new URL(page.url()).searchParams.get('mode'),'catalog');
 await page.reload({waitUntil:'networkidle0'});assert.equal(await page.$$eval('.card-name',x=>x.length),3);
 assert.ok(requests.every(u=>!u.includes('/spoolman/')&&!u.includes('/old-server/')&&!u.includes('statistics.disane')));
 assert.deepEqual(errors,[]);
 }finally{await close();}
});
for(const language of ['en','de','fr'])test(`${language}: profile wins over launch preference; presentation has no selector`,async()=>{
 const {page,errors,close}=await open({language});try{
 assert.equal(await page.$eval('html',e=>e.lang),language);assert.equal(await page.$$('nav [role=combobox]').then(x=>x.length),0);
 assert.equal(await page.$('button[aria-label="Spoolman URL"]'),null);
 await page.setViewport({width:390,height:844});assert.ok(await page.$eval('body',e=>e.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 }finally{await close();}
});
test('inventory forbidden still permits catalog discovery',async()=>{
 const {page,close}=await open({denyInventory:true});try{assert.match(await page.$eval('body',e=>e.innerText),/403/);await click(page,'Color catalog');await page.waitForFunction(()=>document.body.innerText.includes('Transparent'));}finally{await close();}
});
test('native logo and linked spool use shared reel without losing alpha zero',async()=>{
 const {page,errors,close}=await open();try{
 await page.$eval('[id="board-card-filament:17"]',e=>e.click());await page.waitForSelector('.detail-panel',{timeout:3000}).catch(e=>{throw new Error(`${e.message}: ${errors.join('; ')}`)});
 assert.equal(await page.$eval('.detail-panel img',e=>new URL(e.src).pathname),'/api/v1/manufacturers/1/logo');
 assert.equal(await page.$eval('.spool-id',e=>e.getAttribute('href')),'/spools/17');assert.equal(await page.$eval('.spool-id',e=>e.target),'_top');
 await page.waitForFunction(()=>window.__reelCalls?.length>0);const calls=await page.evaluate(()=>window.__reelCalls);assert.deepEqual(calls[0],[0,['#FF000000','#FF000088'],'striped',{view:'full'}]);
 if(process.env.CAPTURE_SWATCH)await page.screenshot({path:process.env.CAPTURE_SWATCH+'/detail.png',fullPage:true});
 assert.match(await page.$eval('.detail-panel',e=>e.innerText),/0 g/);assert.deepEqual(errors,[]);
 }finally{await close();}
});
test('invalid config fails closed without inventory requests',async()=>{
 const {page,requests,close}=await open({badConfig:true});try{assert.ok(await page.$('[role=alert]'));assert.equal(requests.some(u=>u.includes('/api/v1/filaments')),false);}finally{await close();}
});

test('router history restores destination filters and preserves catalog across project navigation',async()=>{
 const {page,close}=await open();try{
 await click(page,'Color catalog');await page.type('nav input[type=text]','Transparent');
 await click(page,'Inventory');await page.type('nav input[type=text]','Blue');
 await page.goBack();await page.waitForFunction(()=>document.querySelector('nav input[type=text]').value==='Transparent');
 await page.goBack();await page.waitForFunction(()=>document.querySelectorAll('.card-name').length===3);assert.equal(await page.$eval('nav input[type=text]',e=>e.value),'');
 await click(page,'Color catalog');await click(page,'Projects');await click(page,'Filaments');await page.reload({waitUntil:'networkidle0'});assert.equal(new URL(page.url()).searchParams.get('mode'),'catalog');assert.ok(await page.evaluate(()=>document.body.innerText.includes('Transparent')));
 }finally{await close();}
});
test('revoked inventory clears open details and cached projections',async()=>{
 const options={};const {page,close}=await open(options);try{
 await page.$eval('[id="board-card-filament:17"]',e=>e.click());await page.waitForSelector('.detail-panel');options.denyInventory=true;
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForFunction(()=>document.body.innerText.includes('403'));await page.waitForFunction(()=>!document.querySelector('.detail-panel'));
 }finally{await close();}
});
test('catalog details expose assignment usage and native management, with no inventory-only filters',async()=>{
 const {page,close}=await open({query:'&mode=catalog'});try{
 await page.$eval('[id="board-card-color:17"]',e=>e.click());await page.waitForSelector('.detail-panel');assert.match(await page.$eval('.detail-panel',e=>e.innerText),/0.*assignment/i);assert.equal(await page.$eval('.detail-panel a',e=>e.getAttribute('href')),'/filaments/colors');
 }finally{await close();}
});

test('parent language/theme and bfcache return keep discovery and synchronize currency',async()=>{
 const options={parent:true};const {page,close}=await open(options);try{
 const frame=page.frames().find(f=>f.url().includes('/plugins/'));assert.ok(frame);await frame.waitForSelector('.card-name');
 await frame.type('nav input[type=text]','Transparent');const before=frame.url();
 await page.evaluate(()=>{document.documentElement.dataset.theme='light';document.documentElement.lang='fr';});
 await frame.waitForFunction(()=>document.documentElement.lang==='fr'&&document.documentElement.dataset.theme==='light');assert.equal(frame.url(),before);assert.equal(await frame.$eval('nav input[type=text]',e=>e.value),'Transparent');
 await frame.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));await page.evaluate(()=>document.documentElement.dataset.theme='dark');await frame.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 await page.reload({waitUntil:'networkidle0'});const restored=page.frames().find(f=>f.url().includes('/plugins/'));await restored.waitForSelector('.card-name');assert.equal(await restored.$eval('nav input[type=text]',e=>e.value),'Transparent');
 }finally{await close();}
});
test('semantic dialog backgrounds are valid in each host theme',async()=>{
 for(const theme of ['brand','light','dark']){const {page,close}=await open();try{
 await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;},theme);await click(page,'Projects');await click(page,'Import Project');await page.waitForSelector('[role=dialog]');
 const color=await page.$eval('[role=dialog]',e=>getComputedStyle(e).backgroundColor);assert.notEqual(color,'rgba(0, 0, 0, 0)');assert.notEqual(color,'transparent');
 }finally{await close();}}
});
test('expired native bootstrap returns to top-level FilaMan login',async()=>{
 const {page,close}=await open({expireSettings:true});try{await page.waitForFunction(()=>location.pathname==='/login');assert.match(new URL(page.url()).searchParams.get('next'),/app\/swatch/);}finally{await close();}
});
test('returning from a project detail preserves the active discovery mode and search',async()=>{
 const {page,close}=await open({query:'&mode=catalog&q=Transparent'});try{
 await page.evaluate(()=>localStorage.setItem('spoolman-projects',JSON.stringify([{id:'demo-project',name:'Demo project',status:'planning',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),filamentUsage:[]}])));
 await click(page,'Projects');await page.waitForFunction(()=>document.body.innerText.includes('Demo project'));
 await page.evaluate(()=>[...document.querySelectorAll('h3,div')].find(e=>e.textContent.trim()==='Demo project')?.click());
 await page.waitForFunction(()=>location.pathname.endsWith('/projects/demo-project'));
 await click(page,'Filaments');await page.waitForFunction(()=>location.pathname.endsWith('/app/swatch'));
 assert.equal(new URL(page.url()).searchParams.get('mode'),'catalog');assert.equal(await page.$eval('nav input[type=text]',e=>e.value),'Transparent');
 await page.reload({waitUntil:'networkidle0'});assert.equal(await page.$eval('.card-name',e=>e.textContent.trim()),'Transparent');
 }finally{await close();}
});
test('French host startup failures use French retry text before profile loading',async()=>{
 const {page,close}=await open({badConfig:true,query:'&spoolman_locale=fr'});try{
 assert.match(await page.$eval('[role=alert]',e=>e.textContent),/Impossible/);assert.ok(await page.evaluate(()=>[...document.querySelectorAll('button')].some(e=>e.textContent==='Réessayer')));
 }finally{await close();}
});
