import notes from './release-notes.json';
import upstream from '../../upstream-source.json';
const repository='akira69/filaman-filament-swatch';
const releaseTag = `filaman-v${notes.version}`;
const published = import.meta.env.VITE_FILAMAN_RELEASE_TAG === releaseTag;
export const releaseStorageKey=`filaman-swatch:${repository}:${notes.version}:seen`;
export const getInstalledReleaseNotes=()=>({
  ...notes, repository, upstream,
  url: `https://github.com/${repository}/${published ? `releases/tag/${releaseTag}` : 'pull/16'}`,
});
