<template>
  <div class="h-12 bg-[#f8f9fa] border-b border-gray-200 flex items-center px-4 gap-2 text-base">
    <button
      v-for="(item, idx) in toolbarButtons"
      :key="idx"
      class="h-9 w-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
      :title="item.label"
    >
      <component :is="item.icon" :size="18" />
    </button>

    <div class="w-px h-6 bg-gray-200 mx-1" />

    <div class="relative" ref="zoomDropdownRef">
      <div
        class="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
        title="点击选择或重置缩放"
        @click="toggleZoomDropdown"
      >
        <span class="font-medium">{{ zoomDisplay }}%</span>
        <ChevronDown :size="14" />
      </div>
      <div v-if="zoomDropdownOpen" class="absolute z-50 mt-1 w-36 bg-white border border-gray-200 rounded shadow-md">
        <div class="max-h-56 overflow-auto py-1">
          <button
            v-for="percent in zoomOptions"
            :key="percent"
            class="w-full text-left px-3 py-2 text-sm"
            :class="Math.round(zoom * 100) === percent
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'hover:bg-gray-50 text-gray-700'"
            @click="selectZoomPercent(percent)"
          >
            {{ percent }}%
          </button>
        </div>
        <div class="border-t border-gray-100 px-3 py-2">
          <div class="text-xs text-gray-500 mb-1">自定义</div>
          <div class="flex items-center gap-2">
            <Input
              v-model="zoomInput"
              type="number"
              class="h-8 text-sm"
              :min="minZoom * 100"
              :max="maxZoom * 100"
              @keydown.enter="applyCustomZoom"
            />
            <span class="text-sm text-gray-500">%</span>
            <Button size="sm" @click="applyCustomZoom">确定</Button>
          </div>
          <button
            class="mt-2 w-full text-left text-xs text-blue-600 hover:text-blue-700"
            @click="resetZoom"
          >
            重置为 100%
          </button>
        </div>
      </div>
    </div>

    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="zoom >= maxZoom ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'"
      title="放大"
      :disabled="zoom >= maxZoom"
      @click="onZoomIn"
    >
      <ZoomIn :size="18" />
    </button>
    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="zoom <= minZoom ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'"
      title="缩小"
      :disabled="zoom <= minZoom"
      @click="onZoomOut"
    >
      <ZoomOut :size="18" />
    </button>

    <div class="w-px h-6 bg-gray-200 mx-1" />

    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="canUndo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'"
      :disabled="!canUndo"
      @click="onUndo"
    >
      <Undo2 :size="18" />
    </button>
    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="canRedo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'"
      :disabled="!canRedo"
      @click="onRedo"
    >
      <Redo2 :size="18" />
    </button>

    <div class="w-px h-6 bg-gray-200 mx-1" />

    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="hasSelection ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'"
      :disabled="!hasSelection"
      @click="onDelete"
    >
      <Trash2 :size="18" />
    </button>
    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="hasSelection ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'"
      :disabled="!hasSelection"
      @click="onCopy"
    >
      <Copy :size="18" />
    </button>
    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="clipboardReady ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'"
      :disabled="!clipboardReady"
      @click="onPaste"
    >
      <ClipboardPaste :size="18" />
    </button>

    <div class="w-px h-6 bg-gray-200 mx-1" />

    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="hasSelection ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'"
      :disabled="!hasSelection"
      title="左旋转"
      @click="onRotateLeft"
    >
      <RotateCcw :size="18" />
    </button>
    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="hasSelection ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'"
      :disabled="!hasSelection"
      title="右旋转"
      @click="onRotateRight"
    >
      <RotateCw :size="18" />
    </button>
    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="hasSelection ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'"
      :disabled="!hasSelection"
      title="水平翻转"
      @click="onFlipHorizontal"
    >
      <FlipHorizontal :size="18" />
    </button>
    <button
      class="h-9 w-9 flex items-center justify-center rounded"
      :class="hasSelection ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'"
      :disabled="!hasSelection"
      title="垂直翻转"
      @click="onFlipVertical"
    >
      <FlipVertical :size="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import {
  PanelsLeftRight,
  LayoutTemplate,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Trash2,
  ClipboardPaste,
  Copy,
  ChevronDown,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
} from 'lucide-vue-next';

const props = defineProps<{
  zoom: number;
  minZoom: number;
  maxZoom: number;
  zoomOptions: number[];
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  clipboardReady: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSelectZoomPercent: (percent: number) => void;
  onApplyCustomZoom: (percent: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
}>();

const zoomDropdownOpen = ref(false);
const zoomInput = ref('100');
const zoomDropdownRef = ref<HTMLDivElement | null>(null);

const toolbarButtons = [
  { icon: PanelsLeftRight, label: '折叠边栏' },
  { icon: LayoutTemplate, label: '页面标签' },
];

watch(
  () => props.zoom,
  (value) => {
    zoomInput.value = String(Math.round(value * 100));
  },
  { immediate: true }
);

const zoomDisplay = computed(() => (zoomInput.value.trim() === '' ? String(Math.round(props.zoom * 100)) : zoomInput.value));

const onOutsideClick = (event: MouseEvent) => {
  if (!zoomDropdownRef.value) return;
  if (!zoomDropdownRef.value.contains(event.target as Node)) {
    zoomDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', onOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onOutsideClick);
});

const toggleZoomDropdown = () => {
  zoomDropdownOpen.value = !zoomDropdownOpen.value;
};

const selectZoomPercent = (percent: number) => {
  props.onSelectZoomPercent(percent);
  zoomDropdownOpen.value = false;
};

const applyCustomZoom = () => {
  const parsed = parseFloat(zoomInput.value);
  if (Number.isNaN(parsed)) return;
  const clampedPercent = Math.min(props.maxZoom * 100, Math.max(props.minZoom * 100, parsed));
  props.onApplyCustomZoom(clampedPercent);
  zoomDropdownOpen.value = false;
};

const resetZoom = () => {
  props.onResetZoom();
  zoomDropdownOpen.value = false;
};
</script>
