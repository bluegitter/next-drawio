import type { SVGShape } from '../types';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { usePointerMove } from './usePointerMove';
import { usePointerUp } from './usePointerUp';
import { useShapeMouseDown } from './useShapeMouseDown';
import { useCanvasMouse } from './useCanvasMouse';
import { useShapeEventBindings } from './useShapeEventBindings';

export type UseCanvasInteractionsArgs = {
  state: {
    svgRef: RefLike<SVGSVGElement>;
    shapes: MaybeRef<SVGShape[]>;
    selectedIds: MaybeRef<Set<string>>;
    selectedShape: MaybeRef<string | null>;
    draggingHandle: MaybeRef<{ connectorId: string; end: 'start' | 'end'; original: any } | null>;
    draggingPolylinePoint: MaybeRef<{ shapeId: string; index: number } | null>;
    isConnecting: MaybeRef<boolean>;
    connectionStart: MaybeRef<string | null>;
    connectionStartPort: MaybeRef<string | null>;
    isDragging: MaybeRef<boolean>;
    isResizing: MaybeRef<boolean>;
    isSelectingBox: MaybeRef<boolean>;
    selectionOriginRef: RefLike<{ x: number; y: number } | null>;
    selectionRect: MaybeRef<{ x: number; y: number; w: number; h: number } | null>;
    hoveredShapeId: MaybeRef<string | null>;
    activePortHighlight: MaybeRef<{ shapeId: string; portId: string } | null>;
    resizeHandle: MaybeRef<string | null>;
    draggingCornerHandle: MaybeRef<{ shapeId: string; handleType: string; startCornerRadius: number } | null>;
    dragStart: MaybeRef<{ x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }>;
    cornerHandlesRef: RefLike<Map<string, SVGRectElement[]>>;
    connectorHandleRef: RefLike<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>;
    portElementsRef: RefLike<Map<string, SVGCircleElement[]>>;
    handleConnectionRef: RefLike<boolean>;
    lastPointerRef: RefLike<{ x: number; y: number; clientX: number; clientY: number }>;
    skipNextCanvasClickClear: RefLike<boolean>;
    setDragStart: (next: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => void;
    setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
    setSelectionRect: (next: { x: number; y: number; w: number; h: number } | null) => void;
    setHoveredShapeId: (next: string | null) => void;
    setActivePortHighlight: (next: { shapeId: string; portId: string } | null) => void;
    setDraggingCornerHandle: (next: { shapeId: string; handleType: string; startCornerRadius: number } | null) => void;
    setDraggingHandle: (next: { connectorId: string; end: 'start' | 'end'; original: any } | null) => void;
    setDraggingPolylinePoint: (next: { shapeId: string; index: number } | null) => void;
    setIsConnecting: (next: boolean) => void;
    setConnectionStart: (next: string | null) => void;
    setConnectionStartPort: (next: string | null) => void;
    setIsDragging: (next: boolean) => void;
    setIsResizing: (next: boolean) => void;
    setResizeHandle: (next: string | null) => void;
    setIsSelectingBox: (next: boolean) => void;
    setTempLine: (next: SVGElement | null) => void;
    tempLine: MaybeRef<SVGElement | null>;
    setSelectedIds: (next: Set<string>) => void;
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
      refreshCornerHandles: (shape: SVGShape) => void;
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
};

export const useCanvasInteractions = ({
  state,
  controller,
  helpers,
  connectorNodeSnap,
  disableSelectionBox = false,
  disableShapeSelection = false,
  disableShapeHover = false,
  onShapeSelect,
}: UseCanvasInteractionsArgs) => {
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
    refreshCornerHandles: controller.selectionUi.refreshCornerHandles,
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

  const bindShapeEvents = useShapeEventBindings({
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
    bindShapeEvents,
  };
};
