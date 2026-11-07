<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, shallowRef, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Pin, PinOff } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import type { FilamentCard } from '@/composables/useFilaments';
import { harmonyModes, loadColorHarmonyWheel, type HarmonyResult } from '@/filaman/color-harmonies';
import { getFlatSwatchStyle } from '@/lib/swatchUtils';

const props = defineProps<{
  filament: FilamentCard;
  allFilaments: FilamentCard[];
  referenceHex: string;
}>();
const emit = defineEmits<{
  (e: 'select-filament', item: FilamentCard): void;
}>();
const { t, locale } = useI18n();
const pinnedIds = inject<Ref<Set<string>>>('pinnedIds');
const togglePin = inject<(filament: FilamentCard) => void>('togglePin');
const host = ref<HTMLElement>();
const available = ref<boolean>();
const showTransparency = ref(false);
const result = shallowRef<HarmonyResult>();
let wheel: ReturnType<Awaited<ReturnType<typeof loadColorHarmonyWheel>>['mountColorHarmonyWheel']> | undefined;

const candidateItems = computed(() => new Map(props.allFilaments
  .filter(item => item.id !== props.filament.id)
  .map(item => [item.id, item])));
const displayHex = (hex: string) => showTransparency.value ? hex : hex.slice(0, 7);
const reference = computed(() => displayHex(props.referenceHex));
const candidates = computed(() => Array.from(candidateItems.value.values(), item => ({
  id: item.id,
  hexes: (item.multiColorHexes ?? [item.colorHex]).map(displayHex),
})));

const modeLabels = {
  similar: 'similar', complementary: 'complementary', analogous: 'analogous',
  triadic: 'triadic', 'split-complementary': 'split',
};
const groups = computed(() => result.value?.groups.map(group => {
  const label = group.offset === 0 ? 'referenceRange' : modeLabels[result.value!.mode];
  return {
    offset: group.offset,
    title: t(`detail.${label}`),
    matches: group.matches.slice(0, 5).flatMap(match => {
      const item = candidateItems.value.get(match.id);
      if (!item) return [];
      const hex = (item.multiColorHexes ?? [item.colorHex]).find(hex => displayHex(hex) === match.hex) ?? match.hex;
      return [{ item, hex }];
    }),
  };
}) ?? []);

onMounted(async () => {
  try {
    const module = await loadColorHarmonyWheel();
    if (!host.value) return;
    wheel = module.mountColorHarmonyWheel(host.value, {
      referenceHex: reference.value,
      candidates: candidates.value,
      modes: harmonyModes,
      mode: 'similar',
      locale: locale.value,
      onChange: next => { result.value = next; },
    });
    available.value = true;
  } catch {
    available.value = false;
  }
});
watch([reference, candidates, locale], ([referenceHex, candidates, locale]) => {
  wheel?.update({ referenceHex, candidates, locale });
});
onBeforeUnmount(() => wheel?.destroy());
</script>

<template>
  <div v-show="available !== false" class="detail-section">
    <div class="harmony-heading">
      <h3 class="section-title">{{ t('detail.colorHarmonies') }}</h3>
      <label v-if="available" class="transparency-toggle">
        <input v-model="showTransparency" type="checkbox" />
        {{ t('detail.includeTransparency') }}
      </label>
    </div>
    <div ref="host" class="shared-harmony-wheel" />
    <template v-if="available">
      <p v-if="!groups.length" class="empty-matches">{{ t('detail.noHarmonyMatches') }}</p>
      <section v-for="group in groups" :key="group.offset ?? 'similar'" class="harmony-group">
        <h4>{{ group.title }}<span v-if="group.offset">{{ group.offset }}°</span></h4>
        <p v-if="!group.matches.length" class="empty-matches">{{ t('detail.noHarmonyMatches') }}</p>
        <div v-for="{ item, hex } in group.matches" :key="item.id" class="harmony-match">
          <button class="harmony-result" type="button" :title="item.name" @click="emit('select-filament', item)">
            <span class="match-swatch" :style="getFlatSwatchStyle(hex)" />
            <span class="match-name">{{ item.name }}</span>
            <span class="match-hex">{{ hex }}</span>
          </button>
          <Button v-if="togglePin" size="icon-sm" variant="ghost" class="harmony-pin"
            :aria-label="t(pinnedIds?.has(item.id) ? 'actions.unpin' : 'actions.pin')"
            :aria-pressed="pinnedIds?.has(item.id) ?? false" @click="togglePin(item)">
            <PinOff v-if="pinnedIds?.has(item.id)" :size="16" aria-hidden="true" />
            <Pin v-else :size="16" aria-hidden="true" />
          </Button>
        </div>
      </section>
    </template>
  </div>
  <slot v-if="available === false" />
</template>

<style scoped>
.detail-section, .harmony-group { display: grid; gap: 8px; }
.harmony-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; }
.section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--muted-foreground); }
.transparency-toggle { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--muted-foreground); }
.shared-harmony-wheel {
  --fm-harmony-surface: var(--muted);
  --fm-harmony-border: var(--border);
  --fm-harmony-text: var(--foreground);
  --fm-harmony-muted: var(--muted-foreground);
}
.harmony-group h4 { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; }
.harmony-group h4 span, .empty-matches, .match-hex { font-size: 11px; color: var(--muted-foreground); }
.harmony-match { display: flex; align-items: center; gap: 4px; padding: 2px 4px; border: 1px solid var(--border); border-radius: 8px; }
.harmony-result { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; padding: 4px; text-align: left; border-radius: 5px; }
.harmony-result:hover { background: var(--muted); }
.harmony-result:focus-visible { outline: 2px solid var(--ring); }
.match-swatch { width: 22px; height: 22px; flex: none; border: 1px solid var(--border); border-radius: 4px; }
.match-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.match-hex { font-family: ui-monospace, monospace; }
.harmony-pin { flex: none; }
</style>
