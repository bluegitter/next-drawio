<template>
  <div
    class="absolute z-50 bg-white border border-gray-200 rounded shadow-lg py-1"
    :style="menuStyle"
    @mouseleave="handleMouseLeave"
  >
    <template v-for="(item, idx) in items" :key="itemKey(item, idx)">
      <div v-if="item === 'divider'" class="my-1 border-t border-gray-200" />
      <div
        v-else
        class="px-3 py-2 grid grid-cols-[20px_1fr_auto] items-center text-sm"
        :class="itemClass(item)"
        :style="{ fontFamily: 'Arial', fontSize: '14px' }"
        @mouseenter="handleMouseEnter(item)"
        @click="handleItemClick(item)"
      >
        <div class="flex justify-center">
          <img v-if="item.checked" :src="checkIcon" alt="checked" class="w-4 h-3" />
        </div>
        <div class="flex items-center gap-1">
          <span>{{ item.label }}</span>
          <span
            v-if="item.badge"
            class="ml-1 text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full"
          >
            {{ item.badge }}
          </span>
        </div>
        <div class="flex items-center gap-2 text-gray-400 text-xs">
          <span v-if="item.shortcut">{{ item.shortcut }}</span>
          <span v-if="item.children">▶</span>
        </div>
        <MenuList
          v-if="item.children && openSub === item.label"
          :items="item.children"
          :is-sub="true"
          :open-sub="openSub"
          :set-open-sub="setOpenSub"
          :on-close="onClose"
          :check-icon="checkIcon"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'MenuList' });

export type MenuItem = {
  label: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  checked?: boolean;
  badge?: string;
  children?: Array<MenuItem | 'divider'>;
};

const props = defineProps<{
  items: Array<MenuItem | 'divider'>;
  isSub?: boolean;
  openSub: string | null;
  setOpenSub: (value: string | null) => void;
  onClose: () => void;
  checkIcon: string;
}>();

const menuStyle = computed(() => ({
  minWidth: '220px',
  marginTop: props.isSub ? '-24px' : '0px',
  marginLeft: props.isSub ? '200px' : '0px',
  fontFamily: 'Arial',
  fontSize: '14px',
}));

const itemKey = (item: MenuItem | 'divider', idx: number) =>
  item === 'divider' ? `divider-${idx}` : item.label;

const itemClass = (item: MenuItem) =>
  item.disabled
    ? 'text-gray-400 cursor-not-allowed'
    : 'hover:bg-gray-100 cursor-pointer';

const handleMouseEnter = (item: MenuItem) => {
  if (item.children) {
    props.setOpenSub(item.label);
  }
};

const handleItemClick = (item: MenuItem) => {
  if (item.disabled || item.children) return;
  item.action?.();
  props.onClose();
};

const handleMouseLeave = () => {
  if (props.isSub) {
    props.setOpenSub(null);
  }
};
</script>
