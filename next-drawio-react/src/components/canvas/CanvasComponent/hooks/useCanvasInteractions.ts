import { usePointerMove } from './usePointerMove';
import { usePointerUp } from './usePointerUp';
import { useShapeMouseDown } from './useShapeMouseDown';
import { useCanvasMouse } from './useCanvasMouse';
import { useShapeEventBindings } from './useShapeEventBindings';
import type { SVGShape } from '../types';
import type React from 'react';

interface UseCanvasInteractionsArgs {
  state: {
    svgRef: React.RefObject<SVGSVGElement>;
    shapes: SVGShape[];
    selectedIds: Set<string>;
    selectedShape: string | null;
    draggingHandle: { connectorId: string; end: 'start' | 'end'; original: any } | null;
    draggingPolylinePoint: { shapeId: string; index: number } | null;
    isConnecting: boolean;
    connectionStart: string | null;
    connectionStartPort: string | null;
    isDragging: boolean;
    isResizing: boolean;
    isSelectingBox: boolean;
    selectionOriginRef: React.MutableRefObject<{ x: number; y: number } | null>;
    selectionRect: { x: number; y: number; w: number; h: number } | null;
    hoveredShapeId: string | null;
    activePortHighlight: { shapeId: string; portId: string } | null;
    resizeHandle: string | null;
    draggingCornerHandle: { shapeId: string; handleType: string; startCornerRadius: number } | null;
    dragStart: { x: number; y: number };
    cornerHandlesRef: React.MutableRefObject<Map<string, SVGRectElement[]>>;
    connectorHandleRef: React.MutableRefObject<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>;
    portElementsRef: React.MutableRefObject<Map<string, SVGCircleElement[]>>;
    handleConnectionRef: React.MutableRefObject<boolean>;
    lastPointerRef: React.MutableRefObject<{ x: number; y: number; clientX: number; clientY: number }>;
    skipNextCanvasClickClear: React.MutableRefObject<boolean>;
    setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
    setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
    setSelectionRect: React.Dispatch<React.SetStateAction<{ x: number; y: number; w: number; h: number } | null>>;
    setHoveredShapeId: React.Dispatch<React.SetStateAction<string | null>>;
    setActivePortHighlight: React.Dispatch<React.SetStateAction<{ shapeId: string; portId: string } | null>>;
    setDraggingCornerHandle: React.Dispatch<React.SetStateAction<{ shapeId: string; handleType: string; startCornerRadius: number } | null>>;
    setDraggingHandle: React.Dispatch<React.SetStateAction<{ connectorId: string; end: 'start' | 'end'; original: any } | null>>;
    setDraggingPolylinePoint: React.Dispatch<React.SetStateAction<{ shapeId: string; index: number } | null>>;
    setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
    setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
    setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
    setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
    setResizeHandle: React.Dispatch<React.SetStateAction<string | null>>;
    setIsSelectingBox: React.Dispatch<React.SetStateAction<boolean>>;
    setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
    tempLine: SVGElement | null;
    setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    setSelectedShape: (id: string | null) => void;
    setSelectedShapes: (ids: string[] | Set<string>) => void;
  };
  controller: {
    historyActions: {
      saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
    };
    geometry: {
      updateConnectorPoints: (shape: SVGShape, points: Array<[number, number]>) => void;
      updatePolylinePoints: (shape: SVGShape, points: Array<[number, number]>) => void;
      updateConnectionLine: (connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => void;
      getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
      getShapeCenter: (shape: SVGShape) => { x: number; y: number };
      getPortPositionById: (shape: SVGShape, portId?: string | null) => { x: number; y: number } | null;
      isLineConnected: (shape: SVGShape) => boolean;
    };
    selectionUi: {
      refreshResizeHandles: (shape: SVGShape) => void;
      showCornerHandles: (shape: SVGShape) => void;
      showResizeHandles: (shape: SVGShape) => void;
      hideResizeHandles: (id: string) => void;
      hideCornerHandles: (id: string) => void;
      showTextSelection: (shape: SVGShape) => void;
      hideTextSelection: (id: string) => void;
      beginEditText: (shape: SVGShape) => void;
    };
    shapeOps: {
      updateShapePosition: (shape: SVGShape, dx: number, dy: number) => void;
      updateShapeSize: (shape: SVGShape, handle: string, dx: number, dy: number) => void;
    };
    shapeCreation: {
      connectShapes: (fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => void;
    };
    connectionActions: {
      startConnection: (fromShape: string, fromPortId?: string) => void;
    };
    connections: {
      findNearestPortElement: (x: number, y: number) => SVGCircleElement | null;
      highlightPortStyle: (el: SVGCircleElement) => void;
      resetPortStyle: (el: SVGCircleElement) => void;
      showPorts: (shape: SVGShape) => void;
      hidePorts: (shapeId: string) => void;
      showConnectorHandles: (shape: SVGShape) => void;
      hideConnectorHandles: (shapeId: string) => void;
    };
    connectorNodes: {
      addConnectorNodeAt: (shape: SVGShape, clientX: number, clientY: number) => void;
    };
  };
  helpers: {
    getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
    getConnectorPoints: (shape: SVGShape) => Array<[number, number]>;
    parsePoints: (points: string) => Array<[number, number]>;
    pointToPolylineDistance: (x: number, y: number, points: Array<[number, number]>) => number;
  };
  connectorNodeSnap: {
    enabled: boolean;
    snapDistance: number;
    alignDistance: number;
  };
  disableSelectionBox?: boolean;
  disableShapeSelection?: boolean;
  disableShapeHover?: boolean;
  onShapeSelect?: (shape: SVGElement | null) => void;
}

export const useCanvasInteractions = ({ state, controller, helpers, connectorNodeSnap, disableSelectionBox = false, disableShapeSelection = false, disableShapeHover = false, onShapeSelect }: UseCanvasInteractionsArgs) => {
  const handleMouseMove = usePointerMove({
    svgRef: state.svgRef,
    shapes: state.shapes,
    selectedIds: state.selectedIds,
    draggingHandle: state.draggingHandle,
    draggingPolylinePoint: state.draggingPolylinePoint,
    isConnecting: state.isConnecting,
    tempLine: state.tempLine,
    connectionStart: state.connectionStart,
    isDragging: state.isDragging,
    isResizing: state.isResizing,
    isSelectingBox: state.isSelectingBox,
    selectionOriginRef: state.selectionOriginRef,
    hoveredShapeId: state.hoveredShapeId,
    activePortHighlight: state.activePortHighlight,
    resizeHandle: state.resizeHandle,
    selectedShape: state.selectedShape,
    draggingCornerHandle: state.draggingCornerHandle,
    dragStart: state.dragStart,
    cornerHandlesRef: state.cornerHandlesRef,
    connectorHandleRef: state.connectorHandleRef,
    portElementsRef: state.portElementsRef,
    setDragStart: state.setDragStart,
    setShapesState: state.setShapesState,
    setSelectionRect: state.setSelectionRect,
    setHoveredShapeId: state.setHoveredShapeId,
    setActivePortHighlight: state.setActivePortHighlight,
    setDraggingCornerHandle: state.setDraggingCornerHandle,
    updateShapePosition: controller.shapeOps.updateShapePosition,
    updateShapeSize: controller.shapeOps.updateShapeSize,
    updateConnectionLine: controller.geometry.updateConnectionLine,
    updateConnectorPoints: controller.geometry.updateConnectorPoints,
    updatePolylinePoints: controller.geometry.updatePolylinePoints,
    refreshResizeHandles: controller.selectionUi.refreshResizeHandles,
    getPointerPosition: helpers.getPointerPosition,
    getShapeBounds: controller.geometry.getShapeBounds,
    getConnectorPoints: helpers.getConnectorPoints,
    parsePoints: helpers.parsePoints,
    isLineConnected: controller.geometry.isLineConnected,
    findNearestPortElement: controller.connections.findNearestPortElement,
    highlightPortStyle: controller.connections.highlightPortStyle,
    resetPortStyle: controller.connections.resetPortStyle,
    showPorts: controller.connections.showPorts,
    hidePorts: controller.connections.hidePorts,
    showCornerHandles: controller.selectionUi.showCornerHandles,
    lastPointerRef: state.lastPointerRef,
    enableConnectorNodeSnap: connectorNodeSnap.enabled,
    connectorNodeSnapDistance: connectorNodeSnap.snapDistance,
    connectorNodeAlignDistance: connectorNodeSnap.alignDistance,
    disableShapeHover,
  });

  const { handleMouseUp } = usePointerUp({
    svgRef: state.svgRef,
    shapes: state.shapes,
    selectedIds: state.selectedIds,
    selectedShape: state.selectedShape,
    draggingHandle: state.draggingHandle,
    draggingPolylinePoint: state.draggingPolylinePoint,
    isConnecting: state.isConnecting,
    connectionStart: state.connectionStart,
    connectionStartPort: state.connectionStartPort,
    isDragging: state.isDragging,
    isResizing: state.isResizing,
    isSelectingBox: state.isSelectingBox,
    selectionRect: state.selectionRect,
    selectionOriginRef: state.selectionOriginRef,
    tempLine: state.tempLine,
    activePortHighlight: state.activePortHighlight,
    hoveredShapeId: state.hoveredShapeId,
    handleConnectionRef: state.handleConnectionRef,
    skipNextCanvasClickClear: state.skipNextCanvasClickClear,
    portElementsRef: state.portElementsRef,
    lastPointerRef: state.lastPointerRef,
    setDraggingHandle: state.setDraggingHandle,
    setDraggingPolylinePoint: state.setDraggingPolylinePoint,
    setIsConnecting: state.setIsConnecting,
    setConnectionStart: state.setConnectionStart,
    setConnectionStartPort: state.setConnectionStartPort,
    setIsDragging: state.setIsDragging,
    setIsResizing: state.setIsResizing,
    setResizeHandle: state.setResizeHandle,
    setDraggingCornerHandle: state.setDraggingCornerHandle,
    setDragStart: state.setDragStart,
    setIsSelectingBox: state.setIsSelectingBox,
    setSelectionRect: state.setSelectionRect,
    setTempLine: state.setTempLine,
    setShapesState: state.setShapesState,
    setSelectedShape: state.setSelectedShape,
    setSelectedShapes: state.setSelectedShapes,
    setActivePortHighlight: state.setActivePortHighlight,
    setHoveredShapeId: state.setHoveredShapeId,
    connectShapes: controller.shapeCreation.connectShapes,
    findNearestPortElement: controller.connections.findNearestPortElement,
    getConnectorPoints: helpers.getConnectorPoints,
    getPortPositionById: controller.geometry.getPortPositionById,
    getShapeBounds: controller.geometry.getShapeBounds,
    getShapeCenter: controller.geometry.getShapeCenter,
    updateConnectorPoints: controller.geometry.updateConnectorPoints,
    showConnectorHandles: controller.connections.showConnectorHandles,
    hidePorts: controller.connections.hidePorts,
    resetPortStyle: controller.connections.resetPortStyle,
    onShapeSelect,
    saveToHistory: controller.historyActions.saveToHistory,
  });

  const handleShapeMouseDown = useShapeMouseDown({
    shapes: state.shapes,
    selectedIds: state.selectedIds,
    isConnecting: state.isConnecting,
    connectionStart: state.connectionStart,
    connectionStartPort: state.connectionStartPort,
    disableShapeSelection,
    getPointerPosition: helpers.getPointerPosition,
    isLineConnected: controller.geometry.isLineConnected,
    startConnection: controller.connectionActions.startConnection,
    connectShapes: controller.shapeCreation.connectShapes,
    setSelectedIds: state.setSelectedIds,
    setIsDragging: state.setIsDragging,
    setDragStart: state.setDragStart,
    onShapeSelect,
  });

  useShapeEventBindings({
    shapes: state.shapes,
    selectedIds: state.selectedIds,
    isConnecting: state.isConnecting,
    draggingHandle: state.draggingHandle,
    disableShapeHover,
    beginEditText: controller.selectionUi.beginEditText,
    addConnectorNodeAt: controller.connectorNodes.addConnectorNodeAt,
    handleShapeMouseDown,
    showConnectorHandles: controller.connections.showConnectorHandles,
    hideConnectorHandles: controller.connections.hideConnectorHandles,
    showPorts: controller.connections.showPorts,
    hidePorts: controller.connections.hidePorts,
    showResizeHandles: controller.selectionUi.showResizeHandles,
    hideResizeHandles: controller.selectionUi.hideResizeHandles,
    showCornerHandles: controller.selectionUi.showCornerHandles,
    hideCornerHandles: controller.selectionUi.hideCornerHandles,
    showTextSelection: controller.selectionUi.showTextSelection,
    hideTextSelection: controller.selectionUi.hideTextSelection,
  });

  const { handleCanvasMouseDown, handleCanvasClick } = useCanvasMouse({
    svgRef: state.svgRef,
    shapes: state.shapes,
    selectedShape: state.selectedShape,
    isConnecting: state.isConnecting,
    tempLine: state.tempLine,
    skipNextCanvasClickClear: state.skipNextCanvasClickClear,
    disableSelectionBox,
    getPointerPosition: helpers.getPointerPosition,
    getConnectorPoints: helpers.getConnectorPoints,
    pointToPolylineDistance: helpers.pointToPolylineDistance,
    setIsSelectingBox: state.setIsSelectingBox,
    setSelectionRect: state.setSelectionRect,
    setSelectedShape: state.setSelectedShape,
    setIsConnecting: state.setIsConnecting,
    setConnectionStart: state.setConnectionStart,
    setConnectionStartPort: state.setConnectionStartPort,
    setTempLine: state.setTempLine,
    selectionOriginRef: state.selectionOriginRef,
    onShapeSelect,
  });

  return {
    handleMouseMove,
    handleMouseUp,
    handleCanvasMouseDown,
    handleCanvasClick,
  };
};
