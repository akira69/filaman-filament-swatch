<script setup lang="ts">
import VendorLogoBadge from '../VendorLogoBadge.vue';
import { X } from 'lucide-vue-next';
import {useI18n} from 'vue-i18n';
import { Button } from '@/components/ui/button';
import { SourceBadge } from '@/components/ui/source-badge';
import {hostContext} from '@/filaman/context';

const {t}=useI18n();
defineProps<{
  name: string;
  vendor?: string|null;
  logoUrl?: string|null;
  material?: string;
  source: string;
  filamanHref:string;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div class="detail-header">
    <div class="detail-title-row">
      <h2 class="detail-title">{{ name }}</h2>
      <Button variant="ghost" size="icon-sm" :aria-label="t('actions.close')" @click="$emit('close')"><X :size="18" aria-hidden="true" /></Button>
    </div>
    <div class="detail-identity-row">
      <VendorLogoBadge v-if="vendor" variant="detail" :vendor-name="vendor" :logo-url="logoUrl">
        <span v-if="material" class="detail-subtitle-row material-label">{{ material }}</span>
      </VendorLogoBadge>
      <span v-else-if="material" class="material-label">{{ material }}</span>
      <a class="detail-filaman-link" :class="{connected:hostContext.connected}" :href="filamanHref" target="_top" :aria-label="`${t('discovery.edit')}: ${name}`" :title="t(hostContext.connected ? 'discovery.connected' : 'discovery.disconnected')"><SourceBadge :source="source" variant="minimal" /></a>
    </div>
  </div>
</template>

<style scoped>
.detail-header {display:flex;flex-direction:column;gap:12px;padding:16px;border-bottom:1px solid var(--border);flex-shrink:0;}
.detail-title-row {display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}
.detail-title {font-family:var(--font-sans);font-size:20px;font-weight:700;line-height:1.3;margin:0;color:rgb(var(--text));overflow-wrap:anywhere;}
.detail-subtitle-row {display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;margin-top:4px;color:rgb(var(--text-muted));}
.material-label {font-size:12px;line-height:20px;}
.detail-identity-row {display:flex;align-items:center;justify-content:space-between;gap:12px;}
.detail-filaman-link {flex-shrink:0;margin-left:auto;color:var(--muted-foreground);}
.detail-filaman-link.connected {color:var(--primary);}
.detail-filaman-link :deep(.source-badge) {color:inherit;padding:0;font-size:11px;letter-spacing:0;text-transform:none;}
.detail-filaman-link:hover {text-decoration:underline;}
.detail-filaman-link:focus-visible {outline:2px solid var(--ring);outline-offset:4px;}
</style>
