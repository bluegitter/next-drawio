import { useImperativeHandle, useMemo } from 'react';
import type React from 'react';
import type { CanvasComponentRef } from '../canvas-types';
import { useCanvasMethods as useCanvasMethodsCore } from '@drawio/core';

interface UseCanvasMethodsArgs {
  ref: React.Ref<CanvasComponentRef>;
  methodsRef: React.MutableRefObject<CanvasComponentRef | null>;
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
  getCanvas: () => SVGSVGElement | null;
  getSelectedShape: (selectedShapeId?: string | null | undefined) => SVGElement | null;
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
  addShapeAt: (type: string, position: { x: number; y: number }) => void;
  setZoom: (next: number) => number;
  zoomBy: (factor: number) => number;
  getZoom: () => number;
  copySelection: () => void;
  pasteClipboard: () => void;
  hasClipboard: () => boolean;
}

export const useCanvasMethods = (args: UseCanvasMethodsArgs) => {
  const { ref, ...coreArgs } = args;
  const methods: CanvasComponentRef = useMemo(() => useCanvasMethodsCore(coreArgs), [coreArgs]);

  useImperativeHandle(ref, () => methods, [methods, ref]);
  return methods;
};
