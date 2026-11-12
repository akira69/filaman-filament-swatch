import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {createServer} from 'vite';

const manifest=JSON.parse(await readFile(new URL('../filaman-plugin/plugin.json', import.meta.url), 'utf8'));

test('installed release notes remain offline and repository/version qualified', async () => {
 const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,ws:false},optimizeDeps:{noDiscovery:true}});
 try {
  const {getInstalledReleaseNotes,releaseStorageKey}=await server.ssrLoadModule('/src/filaman/release.ts');
  const notes=getInstalledReleaseNotes();
  const repository='akira69/filaman-filament-swatch';
  const project=`https://github.com/${repository}`;
  const tag=`filaman-v${manifest.version}`;
  const published=process.env.VITE_FILAMAN_RELEASE_TAG===tag;
  assert.equal(notes.version,manifest.version);
  assert.equal(notes.repository,repository);
  assert.equal(notes.published,published);
  assert.equal(notes.url,published?`${project}/releases/tag/${tag}`:project);
  assert.ok(notes.body.en.trim());
  assert.equal(releaseStorageKey,`filaman-swatch:${repository}:${manifest.version}:seen`);
 } finally {
  await server.close();
 }
});
