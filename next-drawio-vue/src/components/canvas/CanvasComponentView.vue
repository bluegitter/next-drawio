<template>
  <div
    class="relative border border-gray-300 rounded"
    :style="{ width: width * zoom + 'px', height: height * zoom + 'px' }"
    @pointermove="handleMouseMove"
    @pointerup="handleMouseUp"
  >
    <svg
      ref="svgRef"
      :width="width"
      :height="height"
      :viewBox="`${viewBoxMinX} ${viewBoxMinY} ${width} ${height}`"
      :style="svgStyle"
      class="block"
      @mousedown="handleCanvasMouseDown"
      @click="handleCanvasClick"
    >
      <defs>
        <marker id="arrow-end-marker" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
        </marker>
        <marker id="arrow-start-marker" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 10 0 L 0 5 L 10 10 z" fill="context-stroke" />
        </marker>
      </defs>
      <template v-if="pageWidth && lineCountX > 1">
        <line
          v-for="idx in lineCountX - 1"
          :key="`v-${idx}`"
          :x1="-viewBoxMinX + pageWidth * idx"
          y1="0"
          :x2="-viewBoxMinX + pageWidth * idx"
          :y2="height"
          stroke="#d0d0d0"
          stroke-dasharray="6,6"
          stroke-width="1"
        />
      </template>
      <template v-if="pageHeight && lineCountY > 1">
        <line
          v-for="idx in lineCountY - 1"
          :key="`h-${idx}`"
          x1="0"
          :y1="-viewBoxMinY + pageHeight * idx"
          :x2="width"
          :y2="-viewBoxMinY + pageHeight * idx"
          stroke="#d0d0d0"
          stroke-dasharray="6,6"
          stroke-width="1"
        />
      </template>
      <slot />
    </svg>

    <input
      v-if="editingText"
      ref="editingInputRef"
      class="absolute outline-none bg-transparent"
      :style="editingTextStyle"
      :value="editingText.value"
      @input="onEditingInput"
      @blur="() => commitEditingText(true)"
      @keydown="onEditingKeydown"
      @mousedown.stop
    />

    <div
      v-if="selectionRect"
      class="absolute border-2 border-blue-400 border-dashed bg-blue-200/20 pointer-events-none"
      :style="{
        left: (selectionRect.x - viewBoxMinX) * zoom + 'px',
        top: (selectionRect.y - viewBoxMinY) * zoom + 'px',
        width: selectionRect.w * zoom + 'px',
        height: selectionRect.h * zoom + 'px',
      }"
    />

    <div
      v-if="groupSelectionBounds"
      class="absolute pointer-events-none"
      :style="{
        left: (groupSelectionBounds.x - viewBoxMinX) * zoom + 'px',
        top: (groupSelectionBounds.y - viewBoxMinY) * zoom + 'px',
        width: groupSelectionBounds.w * zoom + 'px',
        height: groupSelectionBounds.h * zoom + 'px',
      }"
    >
      <div class="absolute inset-0 border-2 border-dashed border-[#36a7ff]" />
      <div
        v-for="(point, idx) in selectionHandles"
        :key="idx"
        class="absolute w-4 h-4 bg-[#36a7ff] rounded-full border-2 border-white"
        :style="{
          left: `calc(${point.x * 100}% - 8px)`,
          top: `calc(${point.y * 100}% - 8px)`,
        }"
      />
      <div
        class="absolute w-5 h-5 bg-white border-2 border-[#36a7ff] rounded-full flex items-center justify-center text-xs text-[#36a7ff]"
        :style="{ right: '-18px', top: '-18px' }"
      >
        ⟳
      </div>
    </div>

    <div
      v-for="handle in polylineHandles"
      :key="`${handle.shapeId}-${handle.index}`"
      class="absolute w-3 h-3 bg-[#36a7ff] rounded-full border-2 border-white cursor-move z-20"
      :style="{
        left: handle.x * zoom - 6 + 'px',
        top: handle.y * zoom - 6 + 'px',
      }"
      @pointerdown="(e) => handlePolylinePointerDown(e, handle)"
      @pointerup="handlePointerRelease"
      @pointercancel="handlePointerRelease"
    />

    <div v-if="isConnecting" class="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
      连接模式 - 点击目标图形完成连接
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  width: number;
  height: number;
  zoom: number;
  backgroundColor: string;
  viewBoxMinX: number;
  viewBoxMinY: number;
  handleCanvasMouseDown: (e: MouseEvent) => void;
  handleMouseMove: (e: MouseEvent | PointerEvent) => void;
  handleMouseUp: (e: MouseEvent | PointerEvent) => void;
  handleCanvasClick: (e: MouseEvent) => void;
  pageWidth?: number;
  pageHeight?: number;
  pageCountX?: number;
  pageCountY?: number;
  pageOffsetXPages?: number;
  pageOffsetYPages?: number;
  editingText: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    value: string;
    fontSize: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    letterSpacing?: string;
    lineHeight?: string;
    color?: string;
  } | null;
  setEditingText: (value: any) => void;
  commitEditingText: (save: boolean) => void;
  selectionRect: { x: number; y: number; w: number; h: number } | null;
  groupSelectionBounds: { x: number; y: number; w: number; h: number } | null;
  polylineHandles: Array<{ shapeId: string; index: number; x: number; y: number }>;
  setDraggingPolylinePoint: (value: { shapeId: string; index: number } | null) => void;
  setDragStart: (value: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => void;
  isConnecting: boolean;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const editingInputRef = ref<HTMLInputElement | null>(null);

defineExpose({ svgRef, editingInputRef });

const lineCountX = computed(() => (props.pageCountX ? Math.floor(props.pageCountX) : 0));
const lineCountY = computed(() => (props.pageCountY ? Math.floor(props.pageCountY) : 0));

const svgStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  minWidth: `${props.width * props.zoom}px`,
  minHeight: `${props.height * props.zoom}px`,
  position: 'absolute',
  zIndex: 1,
  backgroundImage: 'none',
}));

const editingTextStyle = computed(() => {
  if (!props.editingText) return {};
  return {
    left: `${props.editingText.x}px`,
    top: `${props.editingText.y}px`,
    width: `${props.editingText.width}px`,
    height: `${props.editingText.height}px`,
    padding: 0,
    margin: 0,
    border: 'none',
    boxShadow: 'none',
    fontSize: `${props.editingText.fontSize}px`,
    fontFamily: props.editingText.fontFamily,
    fontWeight: props.editingText.fontWeight,
    fontStyle: props.editingText.fontStyle,
    letterSpacing: props.editingText.letterSpacing,
    lineHeight: props.editingText.lineHeight || `${props.editingText.fontSize}px`,
    color: props.editingText.color,
  } as Record<string, string | number | undefined>;
});

const selectionHandles = [
  { x: 0, y: 0 },
  { x: 0.5, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 0.5 },
  { x: 1, y: 0.5 },
  { x: 0, y: 1 },
  { x: 0.5, y: 1 },
  { x: 1, y: 1 },
];

const onEditingInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  props.setEditingText((prev: any) => (prev ? { ...prev, value: target.value } : prev));
};

const onEditingKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    props.commitEditingText(true);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    props.commitEditingText(false);
  }
};

const handlePolylinePointerDown = (
  event: PointerEvent,
  handle: { shapeId: string; index: number; x: number; y: number }
) => {
  event.stopPropagation();
  event.preventDefault();
  const rect = svgRef.value?.getBoundingClientRect();
  if (!rect) return;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  props.setDraggingPolylinePoint({ shapeId: handle.shapeId, index: handle.index });
  props.setDragStart({ x: handle.x, y: handle.y, viewBoxMinX: props.viewBoxMinX, viewBoxMinY: props.viewBoxMinY });
};

const handlePointerRelease = (event: PointerEvent) => {
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
};

</script>
