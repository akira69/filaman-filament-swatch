<script setup lang="ts">
import { Icon } from '@iconify/vue';

import type {NativeSpoolSummary} from '@/types/discovery';
import FilamanSpoolReel from './FilamanSpoolReel.vue';
import {formatNumber} from '@/filaman/format';
import {useI18n} from 'vue-i18n';
const {t}=useI18n();
defineProps<{
  spools: NativeSpoolSummary[];
  colors: string[];
  colorStyle: 'striped'|'gradient';
  labels: {
    spools: string;
    archived: string;
    remaining: string;
    used: string;
  };
}>();
</script>

<template>
  <div class="detail-section">
    <h3 class="section-title">{{ labels.spools }} ({{ spools.length }})</h3>
    <div class="spools-list">
      <div v-for="spool in spools" :key="spool.id" class="spool-item">
        <div class="spool-header">
          <a class="spool-id underline" :href="spool.href" target="_top">#{{ spool.id }}</a>
          <FilamanSpoolReel :spool="spool" :colors="colors" :color-style="colorStyle" />
          <span v-if="spool.archived" class="spool-badge spool-archived">
            <Icon icon="lucide:archive" class="w-3 h-3" />
            {{ labels.archived }}
          </span>
        </div>
        <div class="spool-details">
          <div v-if="spool.location" class="spool-detail">
            <Icon icon="lucide:map-pin" class="w-3.5 h-3.5" />
            <span>{{ spool.location }}</span>
          </div>
          <div v-if="spool.remainingWeightG !== null" class="spool-detail">
            <Icon icon="lucide:package" class="w-3.5 h-3.5" />
            <span>{{ formatNumber(spool.remainingWeightG!) }} g {{ labels.remaining }}</span>
          </div>
          <span v-if="spool.remainingWeightG === null">{{ t('discovery.unknown') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(var(--text-muted));
  margin: 0;
}

.spools-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spool-item {
  background: rgba(var(--surface-alt), 0.3);
  border: 1px solid rgba(var(--border-rgb), 0.3);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.spool-id {
  font-size: 14px;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  color: rgb(var(--text));
}

.spool-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.spool-archived {
  background: rgba(var(--text-muted), 0.15);
  color: rgb(var(--text-muted));
}

.spool-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spool-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgb(var(--text-muted));
}
</style>
