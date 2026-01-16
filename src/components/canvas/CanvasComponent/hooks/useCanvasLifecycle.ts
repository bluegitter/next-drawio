import { useEffect } from 'react';
import type React from 'react';
import type { CanvasComponentProps, CanvasComponentRef, SVGShape } from '../types';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useBoundsChange } from './useBoundsChange';
import { useAutoResize } from './useAutoResize';
import { useCanvasMethods } from './useCanvasMethods';

interface UseCanvasLifecycleArgs {
  ref: React.Ref<CanvasComponentRef>;
  props: CanvasComponentProps;
  state: {
    svgRef: React.RefObject<SVGSVGElement>;
    shapes: SVGShape[];
    selectedShape: string | null;
    editingText: { id: string } | null;
    setEditingText: React.Dispatch<React.SetStateAction<any>>;
    isConnecting: boolean;
    tempLine: SVGElement | null;
    hasCalledReady: React.MutableRefObject<boolean>;
    methodsRef: React.MutableRefObject<CanvasComponentRef | null>;
    lastBoundsRef: React.MutableRefObject<{ minX: number; minY: number; maxX: number; maxY: number } | null>;
    setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
    setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
    setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
    setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
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
      getSelectedShape: (selectedShapeId: string | null) => SVGElement | null;
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

export const useCanvasLifecycle = ({ ref, props, state, controller, zoom }: UseCanvasLifecycleArgs) => {
  const {
    onReady,
    onBoundsChange,
    autoResize = false,
  } = props;

  useKeyboardShortcuts({
    deleteSelected: controller.selectionActions.deleteSelected,
    duplicateSelected: controller.clipboard.duplicateSelected,
    copySelection: controller.clipboard.copySelection,
    pasteClipboard: controller.clipboard.pasteClipboard,
    undo: controller.historyActions.undo,
    redo: controller.historyActions.redo,
    clearSelection: controller.selectionActions.clearSelection,
    selectAllShapes: controller.selectionActions.selectAllShapes,
    combineSelected: controller.selectionActions.combineSelected,
    ungroupSelected: controller.selectionActions.ungroupSelected,
    isConnecting: state.isConnecting,
    tempLine: state.tempLine,
    svgRef: state.svgRef,
    setTempLine: state.setTempLine,
    setIsConnecting: state.setIsConnecting,
    setConnectionStart: state.setConnectionStart,
    setConnectionStartPort: state.setConnectionStartPort,
  });

  useBoundsChange({
    shapes: state.shapes,
    getShapeBounds: controller.geometry.getShapeBounds,
    lastBoundsRef: state.lastBoundsRef,
    onBoundsChange,
  });

  useAutoResize({
    autoResize,
    width: props.width,
    height: props.height,
    shapes: state.shapes,
    getShapeBounds: controller.geometry.getShapeBounds,
  });

  useEffect(() => {
    if (!state.editingText) return;
    const exists = state.shapes.some(s => s.id === state.editingText?.id);
    if (!exists) {
      state.setEditingText(null);
    }
  }, [state.editingText, state.setEditingText, state.shapes]);

  useCanvasMethods({
    ref,
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
    getCanvas: () => state.svgRef.current,
    getSelectedShape: () => controller.selectionActions.getSelectedShape(state.selectedShape),
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
    addShapeAt: controller.shapeCreation.addShapeAt,
    setZoom: zoom.applyZoom,
    zoomBy: zoom.zoomBy,
    getZoom: zoom.getZoom,
    copySelection: controller.clipboard.copySelection,
    pasteClipboard: controller.clipboard.pasteClipboard,
    hasClipboard: controller.clipboard.hasClipboard,
  });

  useEffect(() => {
    if (state.svgRef.current && onReady && state.methodsRef.current && !state.hasCalledReady.current) {
      onReady(state.svgRef.current, state.methodsRef.current);
      state.hasCalledReady.current = true;
    }
  }, [onReady, state.hasCalledReady, state.methodsRef, state.svgRef]);
};
