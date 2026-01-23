import type { CanvasComponentRef } from '../types';
import type { RefLike } from '../../utils/refs';
import { setRefValue } from '../../utils/refs';

export type UseCanvasMethodsArgs = {
  methodsRef: RefLike<CanvasComponentRef | null>;
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
};

export const useCanvasMethods = ({
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
  const methods: CanvasComponentRef = {
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
  };

  setRefValue(methodsRef, methods);
  return methods;
};
