<template>
  <div class="min-h-screen h-screen overflow-hidden bg-[#f5f5f5] flex flex-col text-sm text-gray-700">
    <TopMenuBar
      :can-undo="canUndo"
      :can-redo="canRedo"
      :has-selection="hasSelection"
      :multi-selected="multiSelected"
      :clipboard-ready="clipboardReady"
      :show-grid="showGrid"
      :on-toggle-grid="() => (showGrid = !showGrid)"
      :on-undo="handleUndo"
      :on-redo="handleRedo"
      :on-cut="handleCut"
      :on-copy="handleCopy"
      :on-paste="handlePaste"
      :on-delete="handleDelete"
      :on-duplicate="handleDuplicate"
      :on-select-all="handleSelectAll"
      :on-clear-selection="handleClearSelection"
      :on-ungroup="handleUngroup"
      :on-bring-to-front="handleBringToFront"
      :on-send-to-back="handleSendToBack"
      :on-move-forward="handleMoveForward"
      :on-move-backward="handleMoveBackward"
      :on-combine-selected="handleCombineSelected"
      :on-save-file="handleSaveFile"
      :on-open-file="handleOpenFile"
    />

    <Toolbar
      :zoom="zoom"
      :min-zoom="MIN_ZOOM"
      :max-zoom="MAX_ZOOM"
      :zoom-options="zoomOptions"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :has-selection="hasSelection"
      :clipboard-ready="clipboardReady"
      :on-zoom-in="handleZoomIn"
      :on-zoom-out="handleZoomOut"
      :on-reset-zoom="handleResetZoom"
      :on-select-zoom-percent="handleSelectZoomPercent"
      :on-apply-custom-zoom="handleApplyCustomZoom"
      :on-undo="handleUndo"
      :on-redo="handleRedo"
      :on-delete="handleDelete"
      :on-copy="handleCopy"
      :on-paste="handlePaste"
      :on-rotate-left="handleRotateLeft"
      :on-rotate-right="handleRotateRight"
      :on-flip-horizontal="handleFlipHorizontal"
      :on-flip-vertical="handleFlipVertical"
    />

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <LeftSidebar
        :on-tool-select="handleToolChange"
        :on-add-shape-at="(type) => canvasMethodsRef?.addShapeAt?.(type, { x: 120, y: 120 })"
        :on-add-icon="(url, name) => canvasMethodsRef?.addSvgIcon?.(url, { width: 80, height: 60, iconName: name })"
      />

      <CanvasArea
        ref="canvasAreaRef"
        :on-context-menu="handleCanvasContextMenu"
        :on-drop="handleCanvasDrop"
        :on-drag-over="handleCanvasDragOver"
        :show-grid="showGrid"
        :background-color="backgroundColor"
        :grid-bg="GRID_BG"
        :zoom="zoom"
        :page-width="PAGE_WIDTH"
        :page-height="PAGE_HEIGHT"
        :page-count-x="pageNegX + pageCountX"
        :page-count-y="pageNegY + pageCountY"
        :page-offset-x-pages="pageNegX"
        :page-offset-y-pages="pageNegY"
        :on-bounds-change="handleBoundsChange"
        :on-ready="handleCanvasReady"
        :on-error="handleCanvasError"
        :on-shape-select="handleShapeSelect"
        :on-canvas-change="handleCanvasChange"
        :on-clipboard-change="handleClipboardChange"
      />

      <div class="flex flex-col min-h-0 bg-white border-l border-gray-200 w-80">
        <div class="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
          <PropertyPanel
            :selected-shape="selectedShape"
            :on-fill-change="handleFillChange"
            :on-stroke-change="handleStrokeChange"
            :on-stroke-width-change="handleStrokeWidthChange"
            :on-rotation-change="handleRotationChange"
            :on-scale-change="handleScaleChange"
            :on-opacity-change="handleOpacityChange"
            :on-arrow-change="handleArrowChange"
            :on-delete="handleDelete"
            :on-duplicate="handleDuplicate"
            :on-bring-to-front="handleBringToFront"
            :on-send-to-back="handleSendToBack"
          />
        </div>
      </div>
    </div>

    <StatusBar
      :canvas-width="canvasWidth"
      :canvas-height="canvasHeight"
      :current-tool="currentTool"
    />

    <ContextMenu
      ref="contextMenuComponentRef"
      :context-menu="contextMenu"
      :on-close="closeContextMenu"
      :has-selection="hasSelection"
      :multi-selected="multiSelected"
      :selection-count="selectionCountFromCanvas"
      :on-delete="handleDelete"
      :on-cut="handleCut"
      :on-copy="handleCopy"
      :on-duplicate="handleDuplicate"
      :on-ungroup="handleUngroup"
      :on-bring-to-front="handleBringToFront"
      :on-send-to-back="handleSendToBack"
      :on-move-forward="handleMoveForward"
      :on-move-backward="handleMoveBackward"
      :on-combine-selected="handleCombineSelected"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch, watchEffect } from 'vue';
import type { CanvasComponentRef } from "./components/canvas/canvas-types";
import type { ToolType } from '@drawio/core';
import TopMenuBar from '@/components/editor/TopMenuBar.vue';
import Toolbar from '@/components/editor/Toolbar.vue';
import LeftSidebar from '@/components/editor/LeftSidebar.vue';
import CanvasArea from '@/components/editor/CanvasArea.vue';
import StatusBar from '@/components/editor/StatusBar.vue';
import ContextMenu from '@/components/editor/ContextMenu.vue';
import PropertyPanel from '@/components/PropertyPanel.vue';
import { useCanvasZoom } from '@/components/editor/hooks/useCanvasZoom';
import { useCanvasBounds } from '@/components/editor/hooks/useCanvasBounds';
import { useSelectionStyleActions } from '@/components/editor/hooks/useSelectionStyleActions';
import { useCanvasActions } from '@/components/editor/hooks/useCanvasActions';

const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 700;
const GRID_BG =
  'data:image/svg+xml;base64,PHN2ZyBzdHlsZT0iY29sb3Itc2NoZW1lOiBsaWdodCBkYXJrOyIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMCAxMCBMIDQwIDEwIE0gMTAgMCBMIDEwIDQwIE0gMCAyMCBMIDQwIDIwIE0gMjAgMCBMIDIwIDQwIE0gMCAzMCBMIDQwIDMwIE0gMzAgMCBMIDMwIDQwIiBmaWxsPSJub25lIiBzdHlsZT0ic3Ryb2tlOmxpZ2h0LWRhcmsoI2QwZDBkMCwgIzQyNDI0Mik7IiBzdHJva2U9IiNkMGQwZDAiIG9wYWNpdHk9IjAuMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0eWxlPSJzdHJva2U6bGlnaHQtZGFyaygjZDBkMGQwLCAjNDI0MjQyKTsiIHN0cm9rZT0iI2QwZDBkMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+';

const canvasWidth = ref(PAGE_WIDTH);
const canvasHeight = ref(PAGE_HEIGHT);
const backgroundColor = ref('#ffffff');
const currentTool = ref<ToolType>('select');
const selectedShape = ref<SVGElement | null>(null);
const canUndo = ref(false);
const canRedo = ref(false);
const zoom = ref(1);
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;
const ZOOM_FACTOR = 1.2;
const zoomOptions = [50, 75, 90, 100, 110, 125, 150, 200, 300];
const canPaste = ref(false);
const contextMenu = ref({ x: 0, y: 0, open: false });
  const contextMenuRef = ref<HTMLDivElement | null>(null);
  const contextMenuComponentRef = ref<InstanceType<typeof ContextMenu> | null>(null);
const selectionCount = ref(0);
const showGrid = ref(true);
const pageCountX = ref(1);
const pageCountY = ref(1);
const pageNegX = ref(0);
const pageNegY = ref(0);
  const canvasMethodsRef = ref<CanvasComponentRef | null>(null);
const canvasAreaRef = ref<InstanceType<typeof CanvasArea> | null>(null);

const refreshHistoryState = () => {
  if (!canvasMethodsRef.value) return;
  const nextUndo = canvasMethodsRef.value.canUndo();
  const nextRedo = canvasMethodsRef.value.canRedo();
  requestAnimationFrame(() => {
    canUndo.value = nextUndo;
    canRedo.value = nextRedo;
  });
};

const handleCanvasReady = (canvas: SVGSVGElement, methods: CanvasComponentRef) => {
  canvasMethodsRef.value = methods;
  refreshHistoryState();
  zoom.value = methods.getZoom ? methods.getZoom() : 1;
  canPaste.value = methods.hasClipboard ? methods.hasClipboard() : false;
  selectionCount.value = methods.getSelectionCount ? methods.getSelectionCount() : 0;
};

// scrollContainerRef 现在直接作为 prop 传递给 CanvasArea，无需同步

watchEffect(() => {
  const exposedRefs = contextMenuComponentRef.value;
  if (exposedRefs?.contextMenuRef && typeof exposedRefs.contextMenuRef === 'object' && 'value' in exposedRefs.contextMenuRef) {
    contextMenuRef.value = (exposedRefs.contextMenuRef as any).value;
  } else {
    contextMenuRef.value = null;
  }
});

watch([pageCountX, pageCountY, pageNegX, pageNegY], () => {
  const totalX = pageNegX.value + pageCountX.value;
  const totalY = pageNegY.value + pageCountY.value;
  canvasWidth.value = PAGE_WIDTH * totalX;
  canvasHeight.value = PAGE_HEIGHT * totalY;
});

watch(
  () => contextMenu.value.open,
  async (open) => {
    if (!open || !contextMenuRef.value) return;
    await nextTick();
    const rect = contextMenuRef.value.getBoundingClientRect();
    const padding = 8;
    const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
    const maxY = Math.max(padding, window.innerHeight - rect.height - padding);
    const nextX = Math.min(contextMenu.value.x, maxX);
    const nextY = Math.min(contextMenu.value.y, maxY);
    if (nextX !== contextMenu.value.x || nextY !== contextMenu.value.y) {
      contextMenu.value = { ...contextMenu.value, x: nextX, y: nextY };
    }
  }
);

const handleCanvasError = (error: Error) => {
  console.error('Canvas initialization failed:', error);
};

const handleToolChange = (tool: ToolType) => {
  currentTool.value = tool;
  if (canvasMethodsRef.value) {
    switch (tool) {
      case 'rectangle':
        canvasMethodsRef.value.addRectangle();
        break;
      case 'roundedRect':
        canvasMethodsRef.value.addRoundedRect();
        break;
      case 'circle':
        canvasMethodsRef.value.addCircle();
        break;
      case 'triangle':
        canvasMethodsRef.value.addTriangle();
        break;
      case 'line':
        canvasMethodsRef.value.addLine();
        break;
      case 'polyline':
        canvasMethodsRef.value.addPolyline();
        break;
      case 'text':
        canvasMethodsRef.value.addText();
        break;
      case 'delete':
        canvasMethodsRef.value.deleteSelected();
        break;
      case 'clear':
        if (window.confirm('确定要清空画布吗？此操作可能可以通过撤销恢复。')) {
          canvasMethodsRef.value.clearCanvas();
        }
        break;
      case 'connect':
        break;
    }
    refreshHistoryState();
  }
};

const handleShapeSelect = (shape: SVGElement | null) => {
  selectedShape.value = shape;
  if (canvasMethodsRef.value?.getSelectionCount) {
    selectionCount.value = canvasMethodsRef.value.getSelectionCount();
  } else {
    selectionCount.value = shape ? 1 : 0;
  }
};

const handleCanvasChange = () => {
  refreshHistoryState();
};

const {
  handleFillChange,
  handleStrokeChange,
  handleStrokeWidthChange,
  handleRotationChange,
  handleScaleChange,
  handleOpacityChange,
  handleArrowChange,
} = useSelectionStyleActions({ canvasMethodsRef, refreshHistoryState });

const {
  handleDelete,
  handleDuplicate,
  handleBringToFront,
  handleSendToBack,
  handleSelectAll,
  handleClearSelection,
  handleRotateLeft,
  handleRotateRight,
  handleFlipHorizontal,
  handleFlipVertical,
  handleUndo,
  handleRedo,
  handleCopy,
  handlePaste,
  handleCut,
  handleMoveForward,
  handleMoveBackward,
  handleUngroup,
  handleCombineSelected,
} = useCanvasActions({
  canvasMethodsRef,
  refreshHistoryState,
  setSelectionCount: (value) => (selectionCount.value = value),
  setSelectedShape: (value) => (selectedShape.value = value),
  setCanPaste: (value) => (canPaste.value = value),
});

const clientToCanvasPoint = (clientX: number, clientY: number) => {
  const svg = canvasMethodsRef.value?.getCanvas?.();
  if (!svg) return null;
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const totalWidth = PAGE_WIDTH * (pageNegX.value + pageCountX.value);
  const totalHeight = PAGE_HEIGHT * (pageNegY.value + pageCountY.value);
  return {
    x: ((clientX - rect.left) * totalWidth) / rect.width - pageNegX.value * PAGE_WIDTH,
    y: ((clientY - rect.top) * totalHeight) / rect.height - pageNegY.value * PAGE_HEIGHT,
  };
};

const handleClipboardChange = (hasClipboard: boolean) => {
  canPaste.value = hasClipboard;
};

// 创建一个计算属性来获取 scrollContainerRef（必须在 useCanvasZoom 之前定义）
const scrollContainerRefForBounds = computed(() => {
  const exposedRefs = canvasAreaRef.value as any;
  return exposedRefs?.scrollContainerRef || null;
});

const {
  handleZoomIn,
  handleZoomOut,
  handleResetZoom,
  handleSelectZoomPercent,
  handleApplyCustomZoom,
} = useCanvasZoom({
  zoom,
  setZoom: (value) => (zoom.value = value),
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  zoomOptions: [25, 50, 75, 100, 150, 200, 400],
  zoomFactor: ZOOM_FACTOR,
  canvasMethodsRef,
  scrollContainerRef: scrollContainerRefForBounds,
});

const closeContextMenu = () => {
  contextMenu.value = { ...contextMenu.value, open: false };
};

const handleCanvasDrop = (e: DragEvent) => {
  e.preventDefault();
  if (!canvasMethodsRef.value) return;
  const point = clientToCanvasPoint(e.clientX, e.clientY);
  if (!point) return;
  const { x, y } = point;
  const shapeType = e.dataTransfer?.getData('application/x-draw-shape');
  const iconUrl = e.dataTransfer?.getData('application/x-draw-icon');
  const iconName = e.dataTransfer?.getData('application/x-draw-icon-name');

  if (shapeType) {
    const typeMap: Record<string, string> = {
      rectangle: 'rect',
      roundedRect: 'roundedRect',
      circle: 'circle',
      ellipse: 'ellipse',
      triangle: 'triangle',
      diamond: 'diamond',
      trapezoid: 'trapezoid',
      hexagon: 'hexagon',
      pentagon: 'pentagon',
      speech: 'speech',
      wave: 'wave',
      cloud: 'cloud',
      cylinder: 'cylinder',
      line: 'line',
      polyline: 'polyline',
      text: 'text',
      connect: 'connector',
    };
    const mappedType = typeMap[shapeType] || shapeType;
    canvasMethodsRef.value.addShapeAt(mappedType, { x, y });
  } else if (iconUrl) {
    canvasMethodsRef.value.addSvgIcon(iconUrl, {
      width: 80,
      height: 60,
      position: { x, y },
      iconName: iconName || undefined,
    });
  }
};

const handleCanvasDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const handleSaveFile = () => {
  if (!canvasMethodsRef.value?.exportJson) return;
  const json = canvasMethodsRef.value.exportJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'diagram.drawio.json';
  a.click();
  URL.revokeObjectURL(url);
};

const handleOpenFile = (file?: File) => {
  const targetFile = file;
  if (!targetFile) return;
  canvasMethodsRef.value?.clearCanvas?.();
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result?.toString() ?? '';
    canvasMethodsRef.value?.importJson?.(text);
  };
  reader.readAsText(targetFile);
};

const handleBoundsChange = useCanvasBounds({
  pageWidth: PAGE_WIDTH,
  pageHeight: PAGE_HEIGHT,
  pageCountX,
  pageCountY,
  pageNegX,
  pageNegY,
  setPageCountX: (value) => (pageCountX.value = value),
  setPageCountY: (value) => (pageCountY.value = value),
  setPageNegX: (value) => (pageNegX.value = value),
  setPageNegY: (value) => (pageNegY.value = value),
  scrollContainerRef: scrollContainerRefForBounds as any,
  zoom,
});

const handleCanvasContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenu.value = { x: e.clientX, y: e.clientY, open: true };
};

const selectionCountFromCanvas = computed(
  () => canvasMethodsRef.value?.getSelectionCount?.() ?? selectionCount.value
);
const hasSelection = computed(() => selectionCountFromCanvas.value > 0 || !!selectedShape.value);
const multiSelected = computed(() => selectionCountFromCanvas.value > 1);
const clipboardReady = computed(() => canvasMethodsRef.value?.hasClipboard?.() ?? canPaste.value);
</script>
