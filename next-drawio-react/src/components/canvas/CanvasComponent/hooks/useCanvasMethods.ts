import { useImperativeHandle, useMemo } from 'react';
import type React from 'react';
import type { CanvasComponentRef } from '../types';

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

export const useCanvasMethods = ({
  ref,
  methodsRef,
  ZOOM_FACTOR,
  addRectangle,
  addRoundedRect,
  addCircle,
  addTriangle,
  addLine,
  addPolyline,
  addText,
  addSvgIcon,
  selectAll,
  clearSelection,
  combineSelected,
  ungroupSelected,
  deleteSelected,
  clearCanvas,
  exportCanvas,
  getCanvas,
  getSelectedShape,
  getSelectionCount,
  duplicateSelected,
  bringToFront,
  sendToBack,
  moveForward,
  moveBackward,
  rotateSelected,
  rotateSelectedBy,
  flipSelectedHorizontal,
  flipSelectedVertical,
  scaleSelected,
  changeSelectedFill,
  changeSelectedStroke,
  changeSelectedStrokeWidth,
  changeSelectedArrow,
  changeSelectedOpacity,
  undo,
  redo,
  exportJson,
  importJson,
  startConnection,
  connectShapes,
  canUndo,
  canRedo,
  addShapeAt,
  setZoom,
  zoomBy,
  getZoom,
  copySelection,
  pasteClipboard,
  hasClipboard,
}: UseCanvasMethodsArgs) => {
  const methods: CanvasComponentRef = useMemo(() => ({
    addRectangle,
    addRoundedRect,
    addCircle,
    addTriangle,
    addLine,
    addPolyline,
    addText,
    addSvgIcon,
    selectAll,
    clearSelection,
    combineSelected,
    ungroupSelected,
    deleteSelected,
    clearCanvas,
    exportCanvas,
    getCanvas,
    getSelectedShape,
    getSelectionCount,
    duplicateSelected,
    bringToFront,
    sendToBack,
    moveForward,
    moveBackward,
    rotateSelected,
    rotateSelectedBy,
    flipSelectedHorizontal,
    flipSelectedVertical,
    scaleSelected,
    changeSelectedFill,
    changeSelectedStroke,
    changeSelectedStrokeWidth,
    changeSelectedArrow,
    changeSelectedOpacity,
    undo,
    redo,
    exportJson,
    importJson,
    startConnection,
    connectShapes,
    canUndo,
    canRedo,
    addShapeAt,
    setZoom,
    zoomIn: (factor = ZOOM_FACTOR) => zoomBy(factor),
    zoomOut: (factor = ZOOM_FACTOR) => zoomBy(1 / factor),
    getZoom,
    copySelection,
    pasteClipboard,
    hasClipboard,
  }), [ZOOM_FACTOR, addCircle, addLine, addPolyline, addRectangle, addRoundedRect, addShapeAt, addSvgIcon, addText, addTriangle, bringToFront, canRedo, canUndo, changeSelectedArrow, changeSelectedFill, changeSelectedOpacity, changeSelectedStroke, changeSelectedStrokeWidth, clearCanvas, clearSelection, combineSelected, connectShapes, copySelection, deleteSelected, duplicateSelected, exportCanvas, exportJson, flipSelectedHorizontal, flipSelectedVertical, getCanvas, getSelectedShape, getSelectionCount, getZoom, importJson, moveBackward, moveForward, pasteClipboard, redo, rotateSelected, rotateSelectedBy, scaleSelected, selectAll, sendToBack, setZoom, startConnection, undo, ungroupSelected, zoomBy, hasClipboard]);

  methodsRef.current = methods;
  useImperativeHandle(ref, () => methods, [methods, ref]);

  return methods;
};
