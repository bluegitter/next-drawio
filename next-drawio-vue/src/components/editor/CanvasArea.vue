<template>
  <div
    class="flex-1 bg-[#eaeaea] overflow-auto flex"
    :class="isPanning ? 'cursor-grabbing' : (isSpacePressed ? 'cursor-grab' : '')"
    :style="containerStyle"
      ref="internalScrollContainerRef"
    tabindex="0"
    @contextmenu="onContextMenu"
    @drop="onDrop"
    @dragover="onDragOver"
  >
    <div
      class="relative"
      :style="{
        backgroundColor: '#ffffff',
        transform: panTransform,
        width: scaledWidth + 'px',
        height: scaledHeight + 'px',
      }"
    >
      <div
        v-if="showGrid"
        class="absolute inset-0 pointer-events-none"
        :style="gridStyle"
      />
      <CanvasComponent
        :width="pageWidth * pageCountX"
        :height="pageHeight * pageCountY"
        :background-color="showGrid ? 'transparent' : backgroundColor"
        :disable-selection-box="isSpacePressed"
        :disable-shape-selection="isSpacePressed"
        :disable-shape-hover="isSpacePressed"
        :page-width="pageWidth"
        :page-count-x="pageCountX"
        :page-offset-x-pages="pageOffsetXPages"
        :page-height="pageHeight"
        :page-count-y="pageCountY"
        :page-offset-y-pages="pageOffsetYPages"
        :on-bounds-change="onBoundsChange"
        :on-ready="onReady"
        :on-error="onError"
        :on-shape-select="onShapeSelect"
        :on-canvas-change="onCanvasChange"
        :on-clipboard-change="onClipboardChange"
        :auto-resize="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import CanvasComponent from '@/components/CanvasComponent.vue';
import type { CanvasComponentRef } from '@/components/canvas/CanvasComponent/types';
import { useSpacePan } from '@/components/editor/hooks/useSpacePan';

const props = defineProps<{
  onContextMenu: (e: MouseEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  showGrid: boolean;
  backgroundColor: string;
  gridBg: string;
  zoom: number;
  pageWidth: number;
  pageHeight: number;
  pageCountX: number;
  pageCountY: number;
  pageOffsetXPages: number;
  pageOffsetYPages: number;
  onBoundsChange: (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => void;
  onReady: (canvas: SVGSVGElement, methods: CanvasComponentRef) => void;
  onError: (error: Error) => void;
  onShapeSelect: (shape: SVGElement | null) => void;
  onCanvasChange: () => void;
  onClipboardChange: (hasClipboard: boolean) => void;
}>();

const internalScrollContainerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<CanvasComponentRef | null>(null);

const scaledWidth = computed(() => props.pageWidth * props.pageCountX * props.zoom);
const scaledHeight = computed(() => props.pageHeight * props.pageCountY * props.zoom);

const viewportSize = ref({ width: 0, height: 0 });
const panOffset = ref({ x: 0, y: 0 });

const updateViewportSize = () => {
  const scroller = internalScrollContainerRef.value;
  if (!scroller) return;
  viewportSize.value = { width: scroller.clientWidth, height: scroller.clientHeight };
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  const scroller = internalScrollContainerRef.value;
  if (!scroller) return;
  updateViewportSize();
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateViewportSize);
    resizeObserver.observe(scroller);
  } else {
    window.addEventListener('resize', updateViewportSize);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  } else {
    window.removeEventListener('resize', updateViewportSize);
  }
});

const canScrollX = computed(() => scaledWidth.value > viewportSize.value.width);
const canScrollY = computed(() => scaledHeight.value > viewportSize.value.height);
const shouldCenterX = computed(() => scaledWidth.value > 0 && scaledWidth.value < viewportSize.value.width);
const shouldCenterY = computed(() => scaledHeight.value > 0 && scaledHeight.value < viewportSize.value.height);

const virtualPan = computed(() => ({
  canPanX: !canScrollX.value && !shouldCenterX.value,
  canPanY: !canScrollY.value && !shouldCenterY.value,
  getOffset: () => panOffset.value,
  setOffset: (next: { x: number; y: number }) => {
    panOffset.value = next;
  },
}));

const { isSpacePressed, isPanning } = useSpacePan(internalScrollContainerRef, { virtualPan });

watch([canScrollX, canScrollY, isSpacePressed, shouldCenterX, shouldCenterY], () => {
  if (!isSpacePressed.value || shouldCenterX.value || shouldCenterY.value) {
    panOffset.value = { x: 0, y: 0 };
    return;
  }
  panOffset.value = {
    x: canScrollX.value ? 0 : panOffset.value.x,
    y: canScrollY.value ? 0 : panOffset.value.y,
  };
});

const containerStyle = computed(() => ({
  paddingLeft: shouldCenterX.value ? '0px' : '24px',
  paddingRight: shouldCenterX.value ? '0px' : '16px',
  paddingTop: shouldCenterY.value ? '0px' : '16px',
  paddingBottom: shouldCenterY.value ? '0px' : '16px',
  justifyContent: shouldCenterX.value ? 'center' : 'flex-start',
  alignItems: shouldCenterY.value ? 'center' : 'flex-start',
}));

const panTransform = computed(() => {
  if (panOffset.value.x || panOffset.value.y) {
    return `translate(${panOffset.value.x}px, ${panOffset.value.y}px)`;
  }
  return undefined;
});

const gridStyle = computed(() => ({
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#ffffff',
  backgroundImage: `url(${props.gridBg})`,
  backgroundPosition: '-1px -1px',
  overflow: 'hidden',
  zIndex: 0,
  width: `${scaledWidth.value}px`,
  height: `${scaledHeight.value}px`,
}));

// 暴露 scrollContainerRef 的 getter
defineExpose({ 
  canvasRef,
  get scrollContainerRef() {
    return internalScrollContainerRef.value;
  }
});
</script>
