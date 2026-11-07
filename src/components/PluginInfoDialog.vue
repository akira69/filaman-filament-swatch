<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getInstalledReleaseNotes, releaseStorageKey } from '@/filaman/release';
import { hostContext } from '@/filaman/context';
import { formatDate } from '@/filaman/format';

const { t } = useI18n();
const isOpen = ref(false);
const showChanges = ref(false);
const release = getInstalledReleaseNotes();
const links = [
  {label: 'edition', text: release.repository, url: release.projectUrl},
  {label: 'original', text: release.upstream.repository, url: release.upstreamUrl},
  {label: 'license', text: release.license, url: release.licenseUrl},
];
function open(section: 'about' | 'changes') {
  showChanges.value = section === 'changes';
  isOpen.value = true;
}
function dismiss() {
  if (showChanges.value) localStorage.setItem(releaseStorageKey, '1');
  isOpen.value = false;
}
defineExpose({ open });
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-h-[90dvh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ t(showChanges ? 'changelog.title' : 'pluginInfo.title') }} · {{ release.version }}</DialogTitle>
        <DialogDescription>
          {{ showChanges
            ? t(release.published ? 'changelog.released' : 'pluginInfo.preview', {date: formatDate(release.date)})
            : t('pluginInfo.description') }}
        </DialogDescription>
      </DialogHeader>
      <template v-if="showChanges">
        <p>{{ release.body[hostContext.language] ?? release.body.en }}</p>
        <a class="info-link" :href="release.url" target="_blank" rel="noopener noreferrer">{{ t('changelog.viewOnGithub') }}</a>
      </template>
      <dl class="plugin-credits">
        <div v-for="link in links" :key="link.label">
          <dt>{{ t(`pluginInfo.${link.label}`) }}</dt>
          <dd><a class="info-link" :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.text }}</a></dd>
        </div>
      </dl>
      <a class="info-link" :href="release.issuesUrl" target="_blank" rel="noopener noreferrer">{{ t('pluginInfo.issues') }}</a>
      <Button @click="dismiss">{{ t(showChanges ? 'changelog.gotIt' : 'pluginInfo.close') }}</Button>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.plugin-credits { display: grid; gap: 9px; font-size: 13px; }
.plugin-credits dt { font-weight: 600; }
.info-link { color: var(--primary); text-decoration: underline; overflow-wrap: anywhere; }
.info-link:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
</style>
