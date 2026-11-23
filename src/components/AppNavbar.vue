<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import ColorLibraryIcon from './ColorLibraryIcon.vue';
import { BookOpen } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';


defineProps<{
  pinnedCount: number;
}>();

const emit = defineEmits<{
  (e: 'openPalette'): void;
  (e: 'openGuide', trigger: HTMLElement): void;
  (e: 'openChangelog'): void;
  (e: 'openAbout'): void;
}>();

const { t } = useI18n();
const inFilamanShell=window.parent!==window && !!window.parent.document.getElementById('sidebar-toggle');

const mobileMenuOpen = ref(false);
const mobileMenu = ref<InstanceType<typeof Button> | null>(null);

function openMobilePalette() {
  mobileMenu.value?.$el.focus();
  mobileMenuOpen.value = false;
  emit('openPalette');
}
const appTitle = computed(() => t('app.hostedTitle'));


const handleOpenChangelog = () => {
  emit('openChangelog');
  mobileMenuOpen.value = false;
};

</script>

<template>
  <nav :class="{'in-filaman-shell':inFilamanShell}" class="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgb(var(--surface))] shadow-sm">
    <div class="app-navbar-inner px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
      <button type="button" class="app-brand flex shrink-0 items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
        :aria-label="t('pluginInfo.title')" :title="t('pluginInfo.title')" aria-haspopup="dialog" @click="emit('openAbout')">
        <ColorLibraryIcon :size="20" aria-hidden="true" />
        <span class="hidden sm:inline font-semibold text-[rgb(var(--text))] text-base">{{ appTitle }}</span>
      </button>

      <!-- Right: Controls -->
      <div class="ml-auto flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button type="button" data-guide class="flex items-center gap-1 rounded-lg p-2 text-sm text-[rgb(var(--text))] hover:bg-[var(--border)]"
          :title="t('help.guide')" :aria-label="t('guide.title')" aria-haspopup="dialog" @click="emit('openGuide', $event.currentTarget as HTMLElement)">
          <BookOpen class="w-4 h-4" aria-hidden="true" />
        </button>
        <!-- Desktop: Palette button -->
        <Button
          size="sm"
          variant="outline"
          @click="emit('openPalette')"
          class="relative h-8 sm:h-9 w-8 sm:w-9 p-0 hidden sm:flex"
          aria-haspopup="dialog"
          :aria-label="t('actions.openPalette')"
          :title="t('help.palette')"
        >
          <Icon icon="lucide:bookmark" class="w-4 h-4" />
          <span
            v-if="pinnedCount > 0"
            class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-lg border-2 border-[rgb(var(--surface))]"
          >
            {{ pinnedCount }}
          </span>
        </Button>

        <!-- Desktop: Changelog -->
        <Button
          size="sm"
          variant="outline"
          @click="emit('openChangelog')"
          class="h-8 sm:h-9 w-8 sm:w-9 p-0 hidden sm:flex"
          :aria-label="t('changelog.title')"
          :title="t('help.changes')"
        >
          <Icon icon="lucide:sparkles" class="w-4 h-4" />
        </Button>

        <!-- Mobile: Menu button -->
        <div class="sm:hidden relative">
          <Button
            size="sm"
            variant="outline"
            ref="mobileMenu"
            :aria-expanded="mobileMenuOpen"
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="h-8 w-8 p-0"
            :aria-label="t('actions.menu')"
          >
            <Icon icon="lucide:more-vertical" class="w-4 h-4" />
          </Button>
          <!-- Mobile Menu Dropdown -->
          <Transition name="fade">
            <div v-if="mobileMenuOpen">
              <div class="fixed inset-0 z-40" @click="mobileMenuOpen = false"></div>
              <div class="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-[rgb(var(--surface))] shadow-lg z-50">
                <div class="p-2 flex flex-col gap-1">
                  <hr class="border-[var(--border)]/50 my-1" />
                  <button
                    class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--border)] rounded-md transition-colors"
                    @click="handleOpenChangelog"
                  >
                    <Icon icon="lucide:sparkles" class="w-4 h-4" />
                    {{ t('changelog.title') || 'What\'s New' }}
                  </button>
                  <button type="button" class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--border)] rounded-md transition-colors"
                    @click="emit('openAbout'); mobileMenuOpen = false">
                    <Icon icon="lucide:info" class="w-4 h-4" aria-hidden="true" />
                    {{ t('pluginInfo.title') }}
                  </button>
                  <a
                    href="https://github.com/sponsors/Disane87"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-3 py-2 text-sm text-pink-500 hover:bg-[var(--border)] rounded-md transition-colors"
                    @click="mobileMenuOpen = false"
                  >
                    <Icon icon="lucide:heart" class="w-4 h-4" />
                    {{ t('actions.sponsor') }}
                  </a>
                  <hr class="border-[var(--border)]/50 my-1" />
                  <button
                    class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--border)] rounded-md transition-colors w-full relative"
                    aria-haspopup="dialog"
                    @click="openMobilePalette"
                  >
                    <Icon icon="lucide:bookmark" class="w-4 h-4" />
                    {{ t('info.palette') || 'Palette' }}
                    <span
                      v-if="pinnedCount > 0"
                      class="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold"
                    >
                      {{ pinnedCount }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (max-width:599px) {
  .in-filaman-shell .app-navbar-inner {padding-left:52px;}
  .in-filaman-shell .app-brand {display:none;}
}
</style>
