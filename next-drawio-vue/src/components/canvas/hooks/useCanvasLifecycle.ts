/**
 * Vue 适配层 - 画布生命周期管理
 */
import { onMounted, onUnmounted, watch, watchEffect } from 'vue';
import type { CanvasComponentProps, CanvasComponentRef, SVGShape } from '../canvas-types';
import { useCanvasLifecycle as useCanvasLifecycleCore } from '@drawio/core';
import { useCanvasMethods } from './useCanvasMethods';

interface UseCanvasLifecycleArgs {
  props: CanvasComponentProps;
  state: {
    svgRef: any;
    shapes: any;
    selectedShape: any;
    editingText: any;
    setEditingText: (next: any) => void;
    isConnecting: any;
    tempLine: any;
    hasCalledReady: any;
    methodsRef: any;
    lastBoundsRef: any;
    setTempLine: (next: any) => void;
    setIsConnecting: (next: boolean) => void;
    setConnectionStart: (next: any) => void;
    setConnectionStartPort: (next: any) => void;
  };
  controller: {
    historyActions: {
      undo: () => void;
      redo: () => void;
      canUndo: () => boolean;
      canRedo: () => boolean;
    };
    geometry: {
      getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
    };
    shapeCreation: {
      addRectangle: () => void;
      addRoundedRect: () => void;
      addCircle: () => void;
      addTriangle: () => void;
      addLine: () => void;
      addPolyline: () => void;
      addText: () => void;
      addSvgIcon: (href: string, options?: { width?: number; height?: number; position?: { x: number; y: number }; iconName?: string }) => void;
      connectShapes: (fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => void;
      addShapeAt: (type: string, position: { x: number; y: number }) => void;
    };
    importExport: {
      exportCanvas: (format: 'png' | 'jpg' | 'svg') => void;
      exportJson: () => string;
      importJson: (json: string) => void;
    };
    clipboard: {
      duplicateSelected: () => void;
      copySelection: () => void;
      pasteClipboard: () => void;
      hasClipboard: () => boolean;
    };
    layering: {
      bringToFront: () => void;
      sendToBack: () => void;
      moveForward: () => void;
      moveBackward: () => void;
    };
    selectionActions: {
      clearSelection: () => void;
      selectAllShapes: () => void;
      combineSelected: () => void;
      ungroupSelected: () => void;
      deleteSelected: () => void;
      clearCanvas: () => void;
      getSelectedShape: (selectedShapeId: string | null) => any;
      getSelectionCount: () => number;
    };
    styleActions: {
      rotateSelected: (angle: number) => void;
      rotateSelectedBy: (delta: number) => void;
      flipSelectedHorizontal: () => void;
      flipSelectedVertical: () => void;
      scaleSelected: (scale: number) => void;
      changeSelectedFill: (color: string) => void;
      changeSelectedStroke: (color: string) => void;
      changeSelectedStrokeWidth: (width: number) => void;
      changeSelectedArrow: (mode: 'none' | 'start' | 'end' | 'both') => void;
      changeSelectedOpacity: (opacity: number) => void;
    };
    connectionActions: {
      startConnection: (fromShape: string, fromPortId?: string) => void;
    };
  };
  zoom: {
    ZOOM_FACTOR: number;
    applyZoom: (next: number) => number;
    zoomBy: (factor: number) => number;
    getZoom: () => number;
  };
}

export const useCanvasLifecycle = ({ props, state, controller, zoom }: UseCanvasLifecycleArgs) => {
  const lifecycle = useCanvasLifecycleCore({
    props,
    state,
    controller,
    zoom,
  });

  // 绑定键盘快捷键
  let unbindKeyboard: (() => void) | null = null;
  onMounted(() => {
    unbindKeyboard = lifecycle.bindKeyboardShortcuts();
  });

  onUnmounted(() => {
    unbindKeyboard?.();
  });

  // 监听边界变化
  watch(() => state.shapes, () => {
    lifecycle.checkBounds();
  }, { deep: true });

  // 监听自动调整尺寸
  watch([() => props.width, () => props.height, () => state.shapes, () => props.autoResize], () => {
    lifecycle.checkAutoResize();
  });

  // 监听编辑文本同步
  watch([() => state.editingText, () => state.shapes], () => {
    lifecycle.syncEditingText();
  });

  // 创建方法ref
  useCanvasMethods({
    methodsRef: state.methodsRef,
    ZOOM_FACTOR: zoom.ZOOM_FACTOR,
    addRectangle: controller.shapeCreation.addRectangle,
    addRoundedRect: controller.shapeCreation.addRoundedRect,
    addCircle: controller.shapeCreation.addCircle,
    addTriangle: controller.shapeCreation.addTriangle,
    addLine: controller.shapeCreation.addLine,
    addPolyline: controller.shapeCreation.addPolyline,
    addText: controller.shapeCreation.addText,
    addSvgIcon: controller.shapeCreation.addSvgIcon,
    selectAll: controller.selectionActions.selectAllShapes,
    clearSelection: controller.selectionActions.clearSelection,
    combineSelected: controller.selectionActions.combineSelected,
    ungroupSelected: controller.selectionActions.ungroupSelected,
    deleteSelected: controller.selectionActions.deleteSelected,
    clearCanvas: controller.selectionActions.clearCanvas,
    exportCanvas: controller.importExport.exportCanvas,
    getCanvas: () => state.svgRef.value,
    getSelectedShape: controller.selectionActions.getSelectedShape,
    getSelectionCount: controller.selectionActions.getSelectionCount,
    duplicateSelected: controller.clipboard.duplicateSelected,
    bringToFront: controller.layering.bringToFront,
    sendToBack: controller.layering.sendToBack,
    moveForward: controller.layering.moveForward,
    moveBackward: controller.layering.moveBackward,
    rotateSelected: controller.styleActions.rotateSelected,
    rotateSelectedBy: controller.styleActions.rotateSelectedBy,
    flipSelectedHorizontal: controller.styleActions.flipSelectedHorizontal,
    flipSelectedVertical: controller.styleActions.flipSelectedVertical,
    scaleSelected: controller.styleActions.scaleSelected,
    changeSelectedFill: controller.styleActions.changeSelectedFill,
    changeSelectedStroke: controller.styleActions.changeSelectedStroke,
    changeSelectedStrokeWidth: controller.styleActions.changeSelectedStrokeWidth,
    changeSelectedArrow: controller.styleActions.changeSelectedArrow,
    changeSelectedOpacity: controller.styleActions.changeSelectedOpacity,
    undo: controller.historyActions.undo,
    redo: controller.historyActions.redo,
    exportJson: controller.importExport.exportJson,
    importJson: controller.importExport.importJson,
    startConnection: controller.connectionActions.startConnection,
    connectShapes: controller.shapeCreation.connectShapes,
    canUndo: controller.historyActions.canUndo,
    canRedo: controller.historyActions.canRedo,
    copySelection: controller.clipboard.copySelection,
    pasteClipboard: controller.clipboard.pasteClipboard,
    hasClipboard: controller.clipboard.hasClipboard,
  });

  return lifecycle;
};