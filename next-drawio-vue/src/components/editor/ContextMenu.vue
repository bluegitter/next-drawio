<template>
  <div v-if="contextMenu.open">
    <div
      class="fixed inset-0 z-40"
      @click="onClose"
      @contextmenu.prevent="onClose"
    />
    <div
      class="fixed z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[180px] text-sm text-gray-700"
      ref="contextMenuRef"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
    >
      <template v-for="(item, idx) in items" :key="`menu-${idx}`">
        <div v-if="isDividerItem(item)" class="border-t border-gray-100 my-1" />
        <button
          v-else
          class="w-full text-left px-3 py-2"
          :class="itemClass(item)"
          @click="handleItemClick(item)"
        >
          {{ item.label }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type ContextMenuState = { x: number; y: number; open: boolean };

type ActionItem = {
  type?: 'action';
  label: string;
  action?: () => void;
  disabled?: boolean;
  danger?: boolean;
  badge?: string;
};

type DividerItem = { type: 'divider' };

type MenuItem = ActionItem | DividerItem;

const props = defineProps<{
  contextMenu: ContextMenuState;
  onClose: () => void;
  hasSelection: boolean;
  multiSelected: boolean;
  selectionCount: number;
  onDelete: () => void;
  onCut: () => void;
  onCopy: () => void;
  onDuplicate: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onCombineSelected: () => void;
}>();

const items = computed<MenuItem[]>(() => [
  {
    label: '删除',
    danger: true,
    action: props.onDelete,
    disabled: !props.hasSelection,
    badge: props.multiSelected ? String(props.selectionCount) : undefined,
  },
  { type: 'divider' },
  { label: '剪切', action: props.onCut, disabled: !props.hasSelection },
  { label: '复制', action: props.onCopy, disabled: !props.hasSelection },
  { label: '复制为图像', disabled: true },
  { label: '复制为 SVG', disabled: true },
  { label: '创建副本', action: props.onDuplicate, disabled: !props.hasSelection },
  { type: 'divider' },
  { label: '锁定 / 解锁', disabled: true },
  { label: '设置为默认样式', disabled: true },
  { type: 'divider' },
  { label: '组合', action: props.onCombineSelected, disabled: !props.multiSelected },
  { label: '取消组合', action: props.onUngroup, disabled: !props.hasSelection },
  { label: '对齐', disabled: true },
  { label: '等距分布', disabled: true },
  { type: 'divider' },
  { label: '移至最前', action: props.onBringToFront, disabled: !props.hasSelection },
  { label: '移至最后', action: props.onSendToBack, disabled: !props.hasSelection },
  { label: '上移一层', action: props.onMoveForward, disabled: !props.hasSelection },
  { label: '下移一层', action: props.onMoveBackward, disabled: !props.hasSelection },
]);

// 类型守卫函数
const isDividerItem = (item: MenuItem): item is DividerItem => {
  return item.type === 'divider';
};

const isActionItem = (item: MenuItem): item is ActionItem => {
  return !isDividerItem(item);
};

const itemClass = (item: MenuItem) => {
  if ('type' in item) return '';
  if (item.danger) return 'text-red-600 font-semibold';
  if (item.disabled) return 'text-gray-300 cursor-not-allowed';
  return 'hover:bg-gray-100';
};

const handleItemClick = (item: MenuItem) => {
  if (isDividerItem(item)) return;
  if (item.disabled) return;
  item.action?.();
  props.onClose();
};

const contextMenuRef = ref<HTMLDivElement | null>(null);

defineExpose({ contextMenuRef });
</script>
