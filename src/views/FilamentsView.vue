<template>
  <div class="flex flex-1 flex-col gap-3 sm:gap-6 min-h-0">
    <div class="discovery-modes" role="tablist" :aria-label="t('discovery.mode')">
      <Button v-for="choice in ['inventory','catalog'] as const" :key="choice" class="mode-button" size="sm" variant="ghost" role="tab" :id="`discovery-tab-${choice}`" aria-controls="discovery-panel" :aria-selected="mode === choice" :tabindex="mode === choice ? 0 : -1" @keydown="onModeKeydown" @click="setDiscoveryMode(choice)">
        <component :is="choice === 'inventory' ? Boxes : Palette" :size="18" class="size-[18px]" aria-hidden="true" />
        {{ t(`discovery.${choice}`) }}
      </Button>
    </div>
    <!-- Filter Modal (opened via navbar) -->
    <FilterModal
      :is-open="filterModalOpen ?? false"
      :initial-filters="filters"
      :mode="mode"
      :vendor-options="vendorOptions"
      :material-options="materialOptions"
      :location-options="locationOptions"
      @close="closeFilterModal"
      @apply="applyFilters"
    />

    <section id="discovery-panel" role="tabpanel" :aria-labelledby="`discovery-tab-${mode}`" tabindex="0" class="flex flex-1 flex-col gap-3 sm:gap-6 min-h-0">
      <div v-if="loading && allFilaments.length === 0" class="text-sm text-[rgb(var(--text-muted))]">
        {{ t("status.loading") }}
      </div>
      <div v-else-if="error" class="result-state">
        <p role="status">
          {{ t(permissionDenied ? `status.denied.${mode}` : 'status.error') }}
          <span v-if="!permissionDenied">({{ error }})</span>
        </p>
        <Button v-if="permissionDenied && mode === 'inventory'" size="sm" variant="outline" @click="browseCatalog">
          {{ t('actions.browseCatalog') }}
        </Button>
        <Button v-else-if="!permissionDenied" size="sm" variant="outline" @click="refresh()">
          {{ t('app.retry') }}
        </Button>
      </div>
      <div v-else-if="filtered.length === 0" class="result-state">
        <p role="status">{{ t(`status.${filters.search || hasFacets ? 'noMatches' : 'empty'}.${mode}`) }}</p>
        <div v-if="filters.search || hasFacets" class="flex flex-wrap gap-2">
          <Button v-if="filters.search" size="sm" variant="outline" @click="clearSearch">{{ t('actions.clearSearch') }}</Button>
          <Button v-if="hasFacets" size="sm" variant="outline" @click="resetFacets">{{ t('actions.resetFilters') }}</Button>
        </div>
      </div>
      <div v-else class="flex flex-col flex-1 gap-4 min-h-0">
        <FilamentCarousel
          v-if="viewMode === 'carousel'"
          :items="filtered"
          :count-label="countLabel"
          :labels="cardLabels"
          :filters="filters"
          :sort-labels="sortLabels"
          :view-mode="viewMode"
          @togglePin="togglePin"
          @selectFilament="selectFilament"
          @changeView="changeView"
          :pinned-ids="pinnedIds ?? new Set<string>()"
        />

        <FilamentBoard
          v-else
          :filaments="filtered"
          :pinned-ids="pinnedIds ?? new Set<string>()"
          :labels="boardLabels"
          :filters="filters"
          :sort-labels="sortLabels"
          :view-mode="viewMode"
          @changeView="changeView"
          :title="countLabel"
          @togglePin="togglePin"
          @selectFilament="selectFilament"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick } from "vue";
import { Boxes, Palette } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useI18n } from "vue-i18n";
import { defaultDiscoveryFacets, useFilaments } from "../composables/useFilaments";
import FilterModal from "../components/FilterModal.vue";
import FilamentCarousel from "../components/FilamentCarousel.vue";
import FilamentBoard from "../components/FilamentBoard.vue";
import type { FilamentCard } from "../composables/useFilaments";
import type { Ref } from "vue";

const { t } = useI18n();
const {
  mode, setDiscoveryMode, refresh,
  filtered,
  filters,
  vendorOptions,
  materialOptions,
  locationOptions,
  loading,
  error,
  errorStatus,
  allFilaments,
} = useFilaments();

// Inject shared state from MainApp
const viewMode = inject<Ref<"carousel" | "board">>("viewMode");
const pinnedIds = inject<Ref<Set<string>>>("pinnedIds");
const filterModalOpen = inject<Ref<boolean>>("filterModalOpen");

const togglePin = inject<(filament: { id: string }) => void>("togglePin");
const selectFilament = inject<(filament: FilamentCard) => void>("selectFilament");

const permissionDenied = computed(() => errorStatus.value === 403);
const hasFacets = computed(() => {
  const defaults = defaultDiscoveryFacets();
  return filters.color !== defaults.color || filters.colorType !== defaults.colorType ||
    (mode.value === 'inventory' && (filters.vendor !== defaults.vendor || filters.material !== defaults.material ||
      filters.location !== defaults.location || filters.inventoryScope !== defaults.inventoryScope));
});

function clearSearch() {
  filters.search = '';
  document.querySelector<HTMLInputElement>('nav input')?.focus();
}

function resetFacets() {
  Object.assign(filters, defaultDiscoveryFacets());
  document.getElementById('discovery-panel')?.focus();
}

async function browseCatalog() {
  void setDiscoveryMode('catalog');
  await nextTick();
  document.getElementById('discovery-tab-catalog')?.focus();
}

async function changeView(next: 'board' | 'carousel') {
  if (!viewMode || viewMode.value === next) return;
  viewMode.value = next;
  await nextTick();
  document.querySelector<HTMLButtonElement>(`#discovery-panel [data-view="${next}"]`)?.focus();
}

const onModeKeydown=(event:KeyboardEvent)=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?'inventory':event.key==='End'?'catalog':mode.value==='inventory'?'catalog':'inventory';
  void setDiscoveryMode(next);document.getElementById(`discovery-tab-${next}`)?.focus();
};

const closeFilterModal = () => { if (filterModalOpen) filterModalOpen.value = false; };

// Handle filter apply
const applyFilters = (newFilters: Pick<typeof filters,'vendor'|'material'|'location'|'source'|'colorType'|'inventoryScope'>) => {
  filters.inventoryScope = newFilters.inventoryScope;
  filters.vendor = newFilters.vendor;
  filters.material = newFilters.material;
  filters.location = newFilters.location;
  filters.source = newFilters.source;
  filters.colorType = newFilters.colorType;
};

const countLabel = computed(() =>
  t("info.count", { count: filtered.value.length }),
);

const viewLabels = computed(() => ({
  viewBoard: t("actions.viewBoard"),
  viewCarousel: t("actions.viewCarousel"),
}));

const cardLabels = computed(() => ({
  ...viewLabels.value,
  vendor: t("card.vendor"),
  material: t("card.material"),
  spool: t("card.spool"),
  weight: t("card.weight"),
  copy: t("actions.copy"),
  copied: t("actions.copied"),
  pin: t("actions.pin"),
  unpin: t("actions.unpin"),
}));

const boardLabels = computed(() => ({
  ...viewLabels.value,
  pin: t("actions.pin"),
  unpin: t("actions.unpin"),
  legend: t("info.legend"),
}));

const sortLabels = computed(() => ({
  name: t('filters.sortNameAsc'),
  vendor: t('filters.sortVendorAsc'),
  material: t('filters.sortMaterialAsc'),
  source: t('filters.sortSourceAsc'),
  hue: t('filters.sortHueAsc'),
  luminance: t('filters.sortLuminanceAsc'),
  lightness: t('filters.sortLightnessAsc'),
}));
</script>

<style scoped>
.result-state {display:grid;justify-items:start;gap:12px;padding:12px 4px;font-size:14px;color:var(--muted-foreground);}
.discovery-modes {display:flex;align-items:center;gap:16px;border-bottom:1px solid var(--border);}
.mode-button {min-height:40px;padding:8px 4px;border-radius:0;border-bottom:2px solid transparent;font-family:var(--font-sans);font-size:14px;font-weight:600;gap:8px;color:var(--muted-foreground);}
.mode-button[aria-selected="true"] {border-bottom-color:var(--primary);color:var(--primary);}
.mode-button:hover {background:var(--muted);color:var(--foreground);}
</style>
