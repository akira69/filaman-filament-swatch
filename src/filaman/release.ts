import notes from './release-notes.json';
import upstream from '../../upstream-source.json';
import manifest from '../../filaman-plugin/plugin.json';
const repository = new URL(manifest.homepage).pathname.slice(1);
const releaseTag = `filaman-v${notes.version}`;
const published = import.meta.env.VITE_FILAMAN_RELEASE_TAG === releaseTag;
export const releaseStorageKey=`filaman-swatch:${repository}:${notes.version}:seen`;
export const getInstalledReleaseNotes=()=>({
  ...notes, repository, upstream, published,
  url: `${manifest.homepage}/${published ? `releases/tag/${releaseTag}` : 'pull/16'}`,
  projectUrl: manifest.homepage,
  upstreamUrl: `https://github.com/${upstream.repository}`,
  license: manifest.license,
  licenseUrl: `https://github.com/${upstream.repository}/blob/${upstream.commit}/LICENSE`,
  issuesUrl: `${manifest.homepage}/issues`,
});
