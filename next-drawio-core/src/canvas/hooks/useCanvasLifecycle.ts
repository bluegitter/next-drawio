import type { CanvasComponentProps, CanvasComponentRef, SVGShape } from '../types';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue, setRefValue } from '../../utils/refs';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useBoundsChange } from './useBoundsChange';
import { useAutoResize } from './useAutoResize';

type UseCanvasLifecycleArgs = {
  props: CanvasComponentProps;
  state: {
    svgRef: RefLike<SVGSVGElement>;
    shapes: MaybeRef<SVGShape[]>;
    selectedShape: MaybeRef<string | null>;
    editingText: MaybeRef<{ id: string } | null>;
    setEditingText: (next: any) => void;
    isConnecting: MaybeRef<boolean>;
    tempLine: MaybeRef<SVGElement | null>;
    hasCalledReady: RefLike<boolean>;
    methodsRef: RefLike<CanvasComponentRef | null>;
    lastBoundsRef: RefLike<{ minX: number; minY: number; maxX: number; maxY: number } | null>;
    setTempLine: (next: SVGElement | null) => void;
    setIsConnecting: (next: boolean) => void;
    setConnectionStart: (next: string | null) => void;
    setConnectionStartPort: (next: string | null) => void;
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
};

export const useCanvasLifecycle = ({ props, state, controller, zoom }: UseCanvasLifecycleArgs) => {
  const {
    onReady,
    onBoundsChange,
    autoResize = false,
  } = props;

  const keyboard = useKeyboardShortcuts({
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

  const checkBounds = useBoundsChange({
    shapes: state.shapes,
    getShapeBounds: controller.geometry.getShapeBounds,
    lastBoundsRef: state.lastBoundsRef,
    onBoundsChange,
  });

  const checkAutoResize = useAutoResize({
    autoResize,
    width: props.width,
    height: props.height,
    shapes: state.shapes,
    getShapeBounds: controller.geometry.getShapeBounds,
  });

  const syncEditingText = () => {
    const editing = getRefValue(state.editingText);
    if (!editing) return;
    const shapeList = getRefValue(state.shapes) ?? [];
    const exists = shapeList.some((s) => s.id === editing.id);
    if (!exists) {
      state.setEditingText(null);
    }
  };

  const notifyReady = () => {
    const svg = getRefValue(state.svgRef);
    const methods = getRefValue(state.methodsRef);
    const hasCalled = Boolean(getRefValue(state.hasCalledReady));
    if (svg && onReady && methods && !hasCalled) {
      onReady(svg, methods);
      setRefValue(state.hasCalledReady, true);
    }
  };

  const bindKeyboardShortcuts = () => keyboard.bind();

  return {
    bindKeyboardShortcuts,
    checkBounds,
    checkAutoResize,
    syncEditingText,
    notifyReady,
    zoom,
  };
};
