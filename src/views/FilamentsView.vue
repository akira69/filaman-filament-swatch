<template>
  <div class="flex flex-1 flex-col gap-3 min-h-0">
    <div class="discovery-mode-row">
    <div class="discovery-modes" role="tablist" :aria-label="t('discovery.mode')">
      <Button v-for="choice in ['inventory','catalog'] as const" :key="choice" class="mode-button" size="sm" variant="ghost" role="tab" :id="`discovery-tab-${choice}`" aria-controls="discovery-panel" :aria-selected="mode === choice" :tabindex="mode === choice ? 0 : -1" @keydown="onModeKeydown" @click="setDiscoveryMode(choice)">
        <component :is="choice === 'inventory' ? Boxes : ColorLibraryIcon" :size="18" class="size-[18px]" aria-hidden="true" />
        {{ t(`discovery.${choice}`) }}
      </Button>
    </div>
    <div class="discovery-tab-actions"><div ref="addColorHost"/><span class="results-count" role="status">{{countLabel}}</span></div>
    </div>
    <DiscoveryControls :mode="mode" :filters="filters" :items="allFilaments" :view-mode="viewMode ?? 'board'" :open="colorOpen" :color-host="colorHost" :add-color-host="addColorHost" :active="!!filters.search || hasFacets"
      @toggle-color="colorOpen = !colorOpen" @change-view="changeView" @clear="clearFilters" @catalog-changed="loadMode('catalog')"/>
    <div class="discovery-workspace flex min-h-0 flex-1 gap-4">
    <section id="discovery-panel" role="tabpanel" :aria-labelledby="`discovery-tab-${mode}`" tabindex="0" class="flex min-w-0 flex-1 flex-col gap-3 sm:gap-6 min-h-0">
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
          :labels="cardLabels"
          @togglePin="togglePin"
          @selectFilament="selectFilament"
          :pinned-ids="pinnedIds ?? new Set<string>()"
        />

        <FilamentBoard
          v-else
          :filaments="filtered"
          :pinned-ids="pinnedIds ?? new Set<string>()"
          :labels="boardLabels"
          @togglePin="togglePin"
          @selectFilament="selectFilament"
        />
      </div>
    </section>
    <ColorSearchSidebar :open="colorOpen" :filters="filters" :mode="mode" :count="countLabel" :active="!!filters.search || hasFacets" @close="closeColorSearch" @clear="clearFilters" @host="colorHost = $event"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import ColorLibraryIcon from "@/components/ColorLibraryIcon.vue";
import { computed, inject, nextTick, ref } from "vue";
import { Boxes } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useI18n } from "vue-i18n";
import { defaultDiscoveryFacets, useFilaments } from "../composables/useFilaments";
import DiscoveryControls from "../components/DiscoveryControls.vue";
import ColorSearchSidebar from "../components/ColorSearchSidebar.vue";
import { nativeFilters, readColumnFilters } from '@/filaman/color-search';
import FilamentCarousel from "../components/FilamentCarousel.vue";
import FilamentBoard from "../components/FilamentBoard.vue";
import type { FilamentCard } from "../composables/useFilaments";
import type { Ref } from "vue";

const { t } = useI18n();
const {
  mode, setDiscoveryMode, refresh, loadMode,
  filtered,
  filters,
  loading,
  error,
  errorStatus,
  allFilaments,
} = useFilaments();

// Inject shared state from MainApp
const viewMode = inject<Ref<"carousel" | "board">>("viewMode");
const pinnedIds = inject<Ref<Set<string>>>("pinnedIds");
const colorOpen=ref(false);
const addColorHost=ref<HTMLElement|null>(null);
const colorHost=ref<HTMLElement|null>(null);
function closeColorSearch(){if(!colorOpen.value)return;colorOpen.value=false;void nextTick(()=>document.querySelector<HTMLButtonElement>('[data-color-search]')?.focus());}
function clearFilters(){
 filters.search='';Object.assign(filters,defaultDiscoveryFacets());
 void nextTick(()=>{
  const target=document.querySelector<HTMLElement>(colorOpen.value?'#color-search-input':'[data-color-search]');
  (target&&!target.matches(':disabled')?target:document.getElementById('discovery-panel'))?.focus();
 });
}

const togglePin = inject<(filament: { id: string }) => void>("togglePin");
const selectFilament = inject<(filament: FilamentCard) => void>("selectFilament");

const permissionDenied = computed(() => errorStatus.value === 403);
const hasFacets = computed(() => {
  const defaults = defaultDiscoveryFacets();
  return (nativeFilters.value?Object.keys(readColumnFilters(filters.columnFilters,mode.value,nativeFilters.value)).length>0:!!filters.columnFilters.trim()) || filters.color !== defaults.color || filters.colorType !== defaults.colorType ||
    (mode.value === 'inventory' && (filters.vendor !== defaults.vendor || filters.material !== defaults.material ||
      filters.location !== defaults.location || filters.inventoryScope !== defaults.inventoryScope));
});

function clearSearch() {
  filters.search = '';
  colorOpen.value=true;
  void nextTick(()=>document.querySelector<HTMLInputElement>('#color-search-input')?.focus());
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
  document.querySelector<HTMLButtonElement>(`.discovery-controls [data-view="${next}"]`)?.focus();
}

const onModeKeydown=(event:KeyboardEvent)=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const next=event.key==='Home'?'inventory':event.key==='End'?'catalog':mode.value==='inventory'?'catalog':'inventory';
  void setDiscoveryMode(next);document.getElementById(`discovery-tab-${next}`)?.focus();
};

const countLabel = computed(() =>
  t("info.count", { count: filtered.value.length }),
);

const cardLabels = computed(() => ({
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
  pin: t("actions.pin"),
  unpin: t("actions.unpin"),
  legend: t("info.legend"),
}));

</script>

<style scoped>
.result-state {display:grid;justify-items:start;gap:12px;padding:12px 4px;font-size:14px;color:var(--muted-foreground);}
.discovery-mode-row {display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--border);flex:none;}
.discovery-modes {display:flex;align-items:center;gap:16px;min-width:0;}
.discovery-tab-actions {display:flex;align-items:center;gap:12px;margin-left:auto;flex:none;}
.results-count {text-align:right;font-size:12px;color:var(--muted-foreground);white-space:nowrap;}
.mode-button {min-height:40px;padding:8px 4px;border-radius:0;border-bottom:2px solid transparent;font-family:var(--font-sans);font-size:14px;font-weight:600;gap:8px;color:var(--muted-foreground);}
.mode-button[aria-selected="true"] {border-bottom-color:var(--primary);color:var(--primary);}
.mode-button:hover {background:var(--muted);color:var(--foreground);}
</style>
