/**
 * Vue 适配层 - 创建CanvasComponentRef方法
 */
import type { CanvasComponentRef } from '../canvas-types';
import { useCanvasMethods as useCanvasMethodsCore } from '@drawio/core';

interface UseCanvasMethodsArgs {
  methodsRef: any;
  ZOOM_FACTOR: number;
  addRectangle: () => void;
  addRoundedRect: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addPolyline: () => void;
  addText: () => void;
  addSvgIcon: (href: string, options?: { width?: number; height?: number; position?: { x: number; y: number }; iconName?: string }) => void;
  selectAll: () => void;
  clearSelection: () => void;
  combineSelected: () => void;
  ungroupSelected: () => void;
  deleteSelected: () => void;
  clearCanvas: () => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => void;
  getCanvas: () => any;
  getSelectedShape: (selectedShapeId?: string | null | undefined) => any;
  getSelectionCount: () => number;
  duplicateSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  moveForward: () => void;
  moveBackward: () => void;
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
  undo: () => void;
  redo: () => void;
  exportJson: () => string;
  importJson: (json: string) => void;
  startConnection: (fromShape: string, fromPortId?: string) => void;
  connectShapes: (fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  copySelection: () => void;
  pasteClipboard: () => void;
  hasClipboard: () => boolean;
}

export const useCanvasMethods = (args: UseCanvasMethodsArgs) => {
  const methods = useCanvasMethodsCore({
    ref: { current: null }, // Vue不需要ref参数，通过methodsRef直接设置
    methodsRef: args.methodsRef,
    ZOOM_FACTOR: args.ZOOM_FACTOR,
    ...args,
  });

  // 直接设置methodsRef的值
  args.methodsRef.value = methods as unknown as CanvasComponentRef;
};