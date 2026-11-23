<script setup lang="ts">
import ColorLibraryIcon from "@/components/ColorLibraryIcon.vue";
import { useI18n } from 'vue-i18n';
import { ArrowDown, ArrowLeftRight, ArrowUp, Blend, BookOpen, Bookmark, Boxes, CircleDot, GalleryHorizontal, LayoutGrid, Pin, PinOff, Search, Split, Trash2, Triangle } from 'lucide-vue-next';
import { harmonyModes } from '@/filaman/color-harmonies';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

defineProps<{ isOpen: boolean; trigger?: HTMLElement }>();
const emit = defineEmits<{ (e: 'close'): void }>();
const { t } = useI18n();
const sections = ['browse', 'filter', 'views', 'details', 'harmonies', 'palette'];
const sectionControls = {
  browse: [[Boxes, 'discovery.inventory'], [ColorLibraryIcon, 'discovery.catalog']],
  filter: [[Search, 'search.label'], [ColorLibraryIcon, 'discovery.colorSearch'], [ArrowUp, 'help.ascending'], [ArrowDown, 'help.descending']],
  views: [[LayoutGrid, 'actions.viewBoard'], [GalleryHorizontal, 'actions.viewCarousel']],
  palette: [[Pin, 'actions.pin'], [PinOff, 'actions.unpin'], [Bookmark, 'actions.openPalette'], [Trash2, 'actions.clearPalette']],
} as const;
const modeIcons = { similar: CircleDot, complementary: ArrowLeftRight, analogous: Blend, triadic: Triangle, 'split-complementary': Split };
</script>

<template>
  <Dialog :open="isOpen" @update:open="value => { if (!value) emit('close'); }">
    <DialogContent class="max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-4xl" :show-close-button="false"
      @close-auto-focus="event => { event.preventDefault(); trigger?.focus(); }">
      <DialogHeader class="border-b px-5 py-5 text-left sm:px-7">
        <DialogTitle class="flex items-center gap-3 text-xl leading-tight sm:text-2xl">
          <span class="rounded-lg bg-primary/10 p-2 text-primary"><BookOpen class="size-5" aria-hidden="true" /></span>
          {{ t('guide.title') }}
        </DialogTitle>
        <DialogDescription class="leading-relaxed">{{ t('guide.description') }}</DialogDescription>
      </DialogHeader>
      <div class="guide-body min-h-0 overflow-y-auto px-5 sm:px-7">
        <section v-for="section in sections" :key="section" :data-guide-section="section"
          class="guide-section grid gap-3 border-b py-6 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
          <h3 class="text-left text-base font-semibold leading-snug">
            {{ t(`guide.${section}Title`) }}
          </h3>
          <div class="border-l-2 pl-4 text-sm leading-relaxed sm:border-l-0 sm:pl-0">
            <p class="text-muted-foreground">{{ t(`guide.${section}`) }}</p>
            <ul v-if="section in sectionControls" class="mt-3 flex flex-wrap gap-2">
              <li v-for="[icon, label] in sectionControls[section as keyof typeof sectionControls]" :key="label"
                class="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs">
                <component :is="icon" class="size-4 shrink-0" aria-hidden="true" />{{ t(label) }}
              </li>
            </ul>
          </div>
          <div v-if="section === 'harmonies'" class="text-sm leading-relaxed sm:col-span-2">
            <dl class="space-y-5">
              <div v-for="mode in harmonyModes" :key="mode" :data-color-lesson="mode"
                class="grid gap-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
                <dt class="flex items-start gap-2 font-medium sm:justify-end sm:text-right">
                  <span class="min-w-0">{{ t(`detail.${mode === 'split-complementary' ? 'split' : mode}`) }}</span>
                  <span class="shrink-0 rounded-md bg-muted p-1"><component :is="modeIcons[mode]" class="size-4" aria-hidden="true" /></span>
                </dt>
                <dd class="ml-4 text-muted-foreground sm:ml-0">{{ t(`guide.${mode}`) }}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
      <div class="guide-footer flex justify-end border-t px-5 py-4 sm:px-7">
        <DialogClose as-child><Button class="w-full shrink-0 sm:w-auto">{{ t('actions.close') }}</Button></DialogClose>
      </div>
    </DialogContent>
  </Dialog>
</template>
