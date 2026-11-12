<template>
  <Dialog :open="isOpen" @update:open="!$event && emit('close')">
    <DialogContent class="filter-dialog flex max-h-[90dvh] max-w-md flex-col gap-0 p-0" :show-close-button="false" :aria-describedby="undefined">
      <div class="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
        <DialogTitle>{{ t('filters.filter') }}</DialogTitle>
        <DialogClose as-child>
          <Button variant="ghost" size="icon-sm" :aria-label="t('actions.close')">
            <X :size="18" aria-hidden="true" />
          </Button>
        </DialogClose>
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <!-- Vendor Filter -->
        <fieldset v-if="vendorOptions.length > 0">
          <legend class="text-sm font-semibold text-[rgb(var(--text))] mb-3 uppercase tracking-wider">
            {{ t('filters.vendor') }}
          </legend>
          <div class="space-y-2">
            <label class="flex min-h-7 items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="vendor"
                value="all"
                v-model="filters.vendor"
                class="rounded-full text-[rgb(var(--accent-rgb))]"
              />
              <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent-rgb))]">
                {{ t('filters.all') }}
              </span>
            </label>
            <label
              v-for="vendor in vendorOptions"
              :key="vendor"
              class="flex min-h-7 items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="vendor"
                :value="vendor"
                v-model="filters.vendor"
                class="rounded-full text-[rgb(var(--accent-rgb))]"
              />
              <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent-rgb))]">
                {{ vendor }}
              </span>
            </label>
          </div>
        </fieldset>

        <!-- Material Filter -->
        <fieldset v-if="materialOptions.length > 0">
          <legend class="text-sm font-semibold text-[rgb(var(--text))] mb-3 uppercase tracking-wider">
            {{ t('filters.material') }}
          </legend>
          <div class="space-y-2">
            <label class="flex min-h-7 items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="material"
                value="all"
                v-model="filters.material"
                class="rounded-full text-[rgb(var(--accent-rgb))]"
              />
              <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent-rgb))]">
                {{ t('filters.all') }}
              </span>
            </label>
            <label
              v-for="material in materialOptions"
              :key="material"
              class="flex min-h-7 items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="material"
                :value="material"
                v-model="filters.material"
                class="rounded-full text-[rgb(var(--accent-rgb))]"
              />
              <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent-rgb))]">
                {{ material }}
              </span>
            </label>
          </div>
        </fieldset>

        <!-- Location Filter -->
        <fieldset v-if="locationOptions.length > 0">
          <legend class="text-sm font-semibold text-[rgb(var(--text))] mb-3 uppercase tracking-wider">
            {{ t('filters.location') }}
          </legend>
          <div class="space-y-2">
            <label class="flex min-h-7 items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="location"
                value="all"
                v-model="filters.location"
                class="rounded-full text-[rgb(var(--accent-rgb))]"
              />
              <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent-rgb))]">
                {{ t('filters.all') }}
              </span>
            </label>
            <label
              v-for="location in locationOptions"
              :key="location"
              class="flex min-h-7 items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="location"
                :value="location"
                v-model="filters.location"
                class="rounded-full text-[rgb(var(--accent-rgb))]"
              />
              <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent-rgb))]">
                {{ location }}
              </span>
            </label>
          </div>
        </fieldset>

        <label v-if="mode !== 'catalog'" class="grid gap-2 text-sm font-medium">
          {{ t('filters.inventoryScope') }}
          <select v-model="filters.inventoryScope" class="min-h-9 rounded-md border border-input bg-background px-2">
            <option value="filaments">{{ t('filters.filamentsOnly') }}</option>
            <option value="all_spools">{{ t('filters.allSpoolsOnly') }}</option>
            <option value="on_hand_spools">{{ t('filters.onHandSpoolsOnly') }}</option>
          </select>
        </label>
        <!-- Color Type Filter -->
        <fieldset v-if="mode !== 'catalog'">
          <legend class="text-sm font-semibold text-[rgb(var(--text))] mb-3 uppercase tracking-wider">
            {{ t('filters.colorType') }}
          </legend>
          <div class="space-y-2">
            <label class="flex min-h-7 items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="colorType"
                value="all"
                v-model="filters.colorType"
                class="rounded-full text-[rgb(var(--accent-rgb))]"
              />
              <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent-rgb))]">
                {{ t('filters.all') }}
              </span>
            </label>
            <label class="flex min-h-7 items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="colorType"
                value="single"
                v-model="filters.colorType"
                class="rounded-full text-[rgb(var(--accent-rgb))]"
              />
              <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent-rgb))]">
                {{ t('filters.singleColor') }}
              </span>
            </label>
            <label class="flex min-h-7 items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="colorType"
                value="multi"
                v-model="filters.colorType"
                class="rounded-full text-[rgb(var(--accent-rgb))]"
              />
              <span class="text-sm text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent-rgb))]">
                {{ t('filters.multiColor') }}
              </span>
            </label>
          </div>
        </fieldset>
      </div>
      <div class="flex gap-3 border-t border-border px-5 py-3">
        <Button variant="outline" class="flex-1" @click="resetFilters">{{ t('actions.reset') }}</Button>
        <Button class="apply-filters flex-1" @click="applyFilters">{{ t('filters.apply') }}</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { X } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { defaultDiscoveryFacets, type DiscoveryFilters } from '@/composables/useFilaments';

type FilterState=Pick<DiscoveryFilters,'vendor'|'material'|'location'|'source'|'colorType'|'inventoryScope'>;

const props = defineProps<{
  mode?: string;
  isOpen: boolean;
  initialFilters: FilterState;
  vendorOptions: string[];
  materialOptions: string[];
  locationOptions: string[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', filters: FilterState): void;
}>();

const { t } = useI18n();

const filters = ref<FilterState>({ ...props.initialFilters });

watch(() => props.isOpen, open => {
  if (open) filters.value = { ...props.initialFilters };
});

const resetFilters = () => {
  filters.value = defaultDiscoveryFacets();
};

const applyFilters = () => {
  emit('apply', filters.value);
  emit('close');
};
</script>

<style scoped>
input[type='radio'] { cursor: pointer; accent-color: var(--primary); }

:global(html[data-theme='light']) .apply-filters {
  background-color: color-mix(in srgb, var(--primary) 82%, black);
}
:global(html[data-theme='light']) .apply-filters:hover {
  background-color: color-mix(in srgb, var(--primary) 74%, black);
}
</style>
