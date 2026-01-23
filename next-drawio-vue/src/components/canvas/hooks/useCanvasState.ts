import type { ComputedRef, Ref } from 'vue';
import { computed, ref, shallowRef, watch, watchEffect } from 'vue';
import type { CanvasComponentProps, CanvasComponentRef, HistoryState, SVGShape } from '../canvas-types';
import { createCanvasState, useCanvasState as useCanvasStateCore } from '@drawio/core';

type EditingText = {
  id: string;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  letterSpacing?: string;
  lineHeight?: string;
  color?: string;
} | null;

type DraggingHandle = {
  connectorId: string;
  end: 'start' | 'end';
  original: {
    x: number;
    y: number;
    shapeId?: string | null;
    portId?: string | null;
    dash?: string | null;
  };
} | null;

type DraggingPolylinePoint = { shapeId: string; index: number } | null;
type ActivePortHighlight = { shapeId: string; portId: string } | null;
type DraggingCornerHandle = { shapeId: string; handleType: string; startCornerRadius: number } | null;

export type CanvasState = {
  svgRef: Ref<SVGSVGElement | null>;
  shapes: Ref<SVGShape[]>;
  shapesRef: { value: SVGShape[] };
  setShapes: (next: SVGShape[]) => void;
  selectedIds: Ref<Set<string>>;
  selectedIdsRef: { value: Set<string> };
  setSelectedIds: (next: Set<string>) => void;
  selectedShape: ComputedRef<string | null>;
  setSelectedShape: (id: string | null) => void;
  setSelectedShapes: (ids: string[] | Set<string>) => void;
  history: Ref<HistoryState[]>;
  setHistory: (next: HistoryState[]) => void;
  historyIndex: Ref<number>;
  setHistoryIndex: (next: number) => void;
  zoom: Ref<number>;
  setZoom: (next: number) => void;
  isDragging: Ref<boolean>;
  setIsDragging: (next: boolean) => void;
  isResizing: Ref<boolean>;
  setIsResizing: (next: boolean) => void;
  isSelectingBox: Ref<boolean>;
  setIsSelectingBox: (next: boolean) => void;
  selectionRect: Ref<{ x: number; y: number; w: number; h: number } | null>;
  setSelectionRect: (next: { x: number; y: number; w: number; h: number } | null) => void;
  selectionOriginRef: { value: { x: number; y: number } | null };
  isConnecting: Ref<boolean>;
  setIsConnecting: (next: boolean) => void;
  connectionStart: Ref<string | null>;
  setConnectionStart: (next: string | null) => void;
  connectionStartPort: Ref<string | null>;
  setConnectionStartPort: (next: string | null) => void;
  dragStart: Ref<{ x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }>;
  setDragStart: (next: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => void;
  resizeHandle: Ref<string | null>;
  setResizeHandle: (next: string | null) => void;
  tempLine: Ref<SVGElement | null>;
  setTempLine: (next: SVGElement | null) => void;
  shapeIdCounter: { value: number };
  hasCalledReady: { value: boolean };
  methodsRef: { value: CanvasComponentRef | null };
  portElementsRef: { value: Map<string, SVGCircleElement[]> };
  connectorHandleRef: { value: Map<string, { start: SVGCircleElement; end: SVGCircleElement }> };
  skipNextCanvasClickClear: { value: boolean };
  editingText: Ref<EditingText>;
  setEditingText: (next: EditingText) => void;
  editingInputRef: Ref<HTMLInputElement | null>;
  draggingHandle: Ref<DraggingHandle>;
  setDraggingHandle: (next: DraggingHandle) => void;
  draggingPolylinePoint: Ref<DraggingPolylinePoint>;
  setDraggingPolylinePoint: (next: DraggingPolylinePoint) => void;
  activePortHighlight: Ref<ActivePortHighlight>;
  setActivePortHighlight: (next: ActivePortHighlight) => void;
  hoveredShapeId: Ref<string | null>;
  setHoveredShapeId: (next: string | null) => void;
  resizeHandlesRef: { value: Map<string, SVGRectElement[]> };
  cornerHandlesRef: { value: Map<string, SVGRectElement[]> };
  textSelectionRef: { value: Map<string, SVGRectElement> };
  handleConnectionRef: { value: boolean };
  lastPointerRef: { value: { x: number; y: number; clientX: number; clientY: number } };
  copyBufferRef: { value: { ids: string[]; shapes: SVGShape[] } | null };
  draggingCornerHandle: Ref<DraggingCornerHandle>;
  setDraggingCornerHandle: (next: DraggingCornerHandle) => void;
  viewBoxMinX: ComputedRef<number>;
  viewBoxMinY: ComputedRef<number>;
  viewBoxMaxX: ComputedRef<number>;
  viewBoxMaxY: ComputedRef<number>;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  lastBoundsRef: { value: { minX: number; minY: number; maxX: number; maxY: number } | null };
};

export const useCanvasState = (props: CanvasComponentProps): CanvasState => {
  const coreState = shallowRef(createCanvasState(props));
  const svgRef = ref<SVGSVGElement | null>(null);
  const shapes = ref<SVGShape[]>(coreState.value.shapes);
  const shapesRef = shallowRef<SVGShape[]>(coreState.value.shapes);
  const selectedIds = ref<Set<string>>(coreState.value.selectedIds);
  const selectedIdsRef = shallowRef<Set<string>>(coreState.value.selectedIds);
  const history = ref<HistoryState[]>(coreState.value.history);
  const historyIndex = ref(coreState.value.historyIndex);
  const zoom = ref(coreState.value.zoom);
  const isDragging = ref(coreState.value.isDragging);
  const isResizing = ref(coreState.value.isResizing);
  const isSelectingBox = ref(coreState.value.isSelectingBox);
  const selectionRect = ref<{ x: number; y: number; w: number; h: number } | null>(coreState.value.selectionRect);
  const selectionOriginRef = shallowRef<{ x: number; y: number } | null>(coreState.value.selectionOrigin);
  const isConnecting = ref(coreState.value.isConnecting);
  const connectionStart = ref<string | null>(coreState.value.connectionStart);
  const connectionStartPort = ref<string | null>(coreState.value.connectionStartPort);
  const dragStart = ref(coreState.value.dragStart);
  const resizeHandle = ref<string | null>(coreState.value.resizeHandle);
  const tempLine = ref<SVGElement | null>(coreState.value.tempLine);
  const shapeIdCounter = shallowRef(0);
  const hasCalledReady = shallowRef(false);
  const methodsRef = shallowRef<CanvasComponentRef | null>(null);
  const portElementsRef = shallowRef<Map<string, SVGCircleElement[]>>(new Map());
  const connectorHandleRef = shallowRef<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>(new Map());
  const skipNextCanvasClickClear = shallowRef(false);
  const editingText = ref<EditingText>(coreState.value.editingText);
  const editingInputRef = ref<HTMLInputElement | null>(null);
  const draggingHandle = ref<DraggingHandle>(coreState.value.draggingHandle);
  const draggingPolylinePoint = ref<DraggingPolylinePoint>(coreState.value.draggingPolylinePoint);
  const activePortHighlight = ref<ActivePortHighlight>(coreState.value.activePortHighlight);
  const hoveredShapeId = ref<string | null>(coreState.value.hoveredShapeId);
  const resizeHandlesRef = shallowRef<Map<string, SVGRectElement[]>>(new Map());
  const cornerHandlesRef = shallowRef<Map<string, SVGRectElement[]>>(new Map());
  const textSelectionRef = shallowRef<Map<string, SVGRectElement>>(new Map());
  const handleConnectionRef = shallowRef(false);
  const lastPointerRef = shallowRef({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const copyBufferRef = shallowRef<{ ids: string[]; shapes: SVGShape[] } | null>(null);
  const draggingCornerHandle = ref<DraggingCornerHandle>(coreState.value.draggingCornerHandle);
  const lastBoundsRef = shallowRef<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null);

  const setShapesState = (updater: (prev: SVGShape[]) => SVGShape[]) => {
    shapes.value = updater(shapes.value);
  };
  const setSelectedIdsState = (updater: (prev: Set<string>) => Set<string>) => {
    selectedIds.value = updater(selectedIds.value);
  };
  const setHistoryState = (updater: (prev: HistoryState[]) => HistoryState[]) => {
    history.value = updater(history.value);
  };
  const setHistoryIndexState = (updater: (prev: number) => number) => {
    historyIndex.value = updater(historyIndex.value);
  };
  const setZoomState = (updater: (prev: number) => number) => {
    zoom.value = updater(zoom.value);
  };
  const setIsDraggingState = (updater: (prev: boolean) => boolean) => {
    isDragging.value = updater(isDragging.value);
  };
  const setIsResizingState = (updater: (prev: boolean) => boolean) => {
    isResizing.value = updater(isResizing.value);
  };
  const setIsSelectingBoxState = (updater: (prev: boolean) => boolean) => {
    isSelectingBox.value = updater(isSelectingBox.value);
  };
  const setSelectionRectState = (updater: (prev: { x: number; y: number; w: number; h: number } | null) => { x: number; y: number; w: number; h: number } | null) => {
    selectionRect.value = updater(selectionRect.value);
  };
  const setIsConnectingState = (updater: (prev: boolean) => boolean) => {
    isConnecting.value = updater(isConnecting.value);
  };
  const setConnectionStartState = (updater: (prev: string | null) => string | null) => {
    connectionStart.value = updater(connectionStart.value);
  };
  const setConnectionStartPortState = (updater: (prev: string | null) => string | null) => {
    connectionStartPort.value = updater(connectionStartPort.value);
  };
  const setDragStartState = (updater: (prev: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => {
    dragStart.value = updater(dragStart.value);
  };
  const setResizeHandleState = (updater: (prev: string | null) => string | null) => {
    resizeHandle.value = updater(resizeHandle.value);
  };
  const setTempLineState = (updater: (prev: SVGElement | null) => SVGElement | null) => {
    tempLine.value = updater(tempLine.value);
  };
  const setEditingTextState = (updater: (prev: EditingText) => EditingText) => {
    editingText.value = updater(editingText.value);
  };
  const setDraggingHandleState = (updater: (prev: DraggingHandle) => DraggingHandle) => {
    draggingHandle.value = updater(draggingHandle.value);
  };
  const setDraggingPolylinePointState = (updater: (prev: DraggingPolylinePoint) => DraggingPolylinePoint) => {
    draggingPolylinePoint.value = updater(draggingPolylinePoint.value);
  };
  const setActivePortHighlightState = (updater: (prev: ActivePortHighlight) => ActivePortHighlight) => {
    activePortHighlight.value = updater(activePortHighlight.value);
  };
  const setHoveredShapeIdState = (updater: (prev: string | null) => string | null) => {
    hoveredShapeId.value = updater(hoveredShapeId.value);
  };
  const setDraggingCornerHandleState = (updater: (prev: DraggingCornerHandle) => DraggingCornerHandle) => {
    draggingCornerHandle.value = updater(draggingCornerHandle.value);
  };

  const helpers = useCanvasStateCore({
    props,
    coreState: coreState.value,
    refs: {
      svgRef,
      editingInputRef,
      selectionOriginRef,
      lastBoundsRef,
      shapeIdCounter,
      hasCalledReady,
      methodsRef,
      portElementsRef,
      connectorHandleRef,
      skipNextCanvasClickClear,
      resizeHandlesRef,
      cornerHandlesRef,
      textSelectionRef,
      handleConnectionRef,
      lastPointerRef,
      copyBufferRef,
    },
    shapesRef,
    selectedIdsRef,
    setters: {
      setShapesState,
      setSelectedIdsState,
      setHistoryState,
      setHistoryIndexState,
      setZoomState,
      setIsDraggingState,
      setIsResizingState,
      setIsSelectingBoxState,
      setSelectionRectState,
      setIsConnectingState,
      setConnectionStartState,
      setConnectionStartPortState,
      setDragStartState,
      setResizeHandleState,
      setTempLineState,
      setEditingTextState,
      setDraggingHandleState,
      setDraggingPolylinePointState,
      setActivePortHighlightState,
      setHoveredShapeIdState,
      setDraggingCornerHandleState,
    },
  });

  watch(
    () => props,
    () => {
      helpers.syncProps();
    },
    { deep: true }
  );

  watchEffect(() => {
    helpers.syncRefs();
  });

  const viewBoxMinX = computed(() => {
    const minX = -(props.pageOffsetXPages || 0) * (props.pageWidth || 0);
    return minX;
  });
  const viewBoxMinY = computed(() => {
    // 直接使用props计算，而不是依赖coreState
    const minY = -(props.pageOffsetYPages || 0) * (props.pageHeight || 0);
    return minY;
  });
  const viewBoxMaxX = computed(() => {
    // 直接使用props计算，而不是依赖coreState
    const minX = -(props.pageOffsetXPages || 0) * (props.pageWidth || 0);
    return minX + props.width;
  });
  const viewBoxMaxY = computed(() => {
    // 直接使用props计算，而不是依赖coreState
    const minY = -(props.pageOffsetYPages || 0) * (props.pageHeight || 0);
    return minY + props.height;
  });

  const getPointerPosition = (clientX: number, clientY: number) => {
    return helpers.getPointerPosition(clientX, clientY);
  };

  const selectedShape = computed(() => {
    const first = selectedIds.value.values().next();
    return first.done ? null : first.value;
  });

  const setSelectedShape = (id: string | null) => helpers.setSelectedShape(id);
  const setSelectedShapes = (ids: string[] | Set<string>) => helpers.setSelectedShapes(ids);

  const setShapes = (next: SVGShape[]) => helpers.setShapes(next);
  const setHistory = (next: HistoryState[]) => helpers.setHistory(next);

  return {
    svgRef,
    shapes,
    shapesRef: shapesRef as { value: SVGShape[] },
    setShapes,
    selectedIds,
    selectedIdsRef: selectedIdsRef as { value: Set<string> },
    setSelectedIds: (next) => helpers.setSelectedIds(next),
    selectedShape,
    setSelectedShape,
    setSelectedShapes,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex: (next) => helpers.setHistoryIndex(next),
    zoom,
    setZoom: (next) => helpers.setZoom(next),
    isDragging,
    setIsDragging: (next) => helpers.setIsDragging(next),
    isResizing,
    setIsResizing: (next) => helpers.setIsResizing(next),
    isSelectingBox,
    setIsSelectingBox: (next) => helpers.setIsSelectingBox(next),
    selectionRect,
    setSelectionRect: (next) => helpers.setSelectionRect(next),
    selectionOriginRef: selectionOriginRef as { value: { x: number; y: number } | null },
    isConnecting,
    setIsConnecting: (next) => helpers.setIsConnecting(next),
    connectionStart,
    setConnectionStart: (next) => helpers.setConnectionStart(next),
    connectionStartPort,
    setConnectionStartPort: (next) => helpers.setConnectionStartPort(next),
    dragStart,
    setDragStart: (next) => helpers.setDragStart(next),
    resizeHandle,
    setResizeHandle: (next) => helpers.setResizeHandle(next),
    tempLine,
    setTempLine: (next) => helpers.setTempLine(next),
    shapeIdCounter: shapeIdCounter as { value: number },
    hasCalledReady: hasCalledReady as { value: boolean },
    methodsRef: methodsRef as { value: CanvasComponentRef | null },
    portElementsRef: portElementsRef as { value: Map<string, SVGCircleElement[]> },
    connectorHandleRef: connectorHandleRef as {
      value: Map<string, { start: SVGCircleElement; end: SVGCircleElement }>;
    },
    skipNextCanvasClickClear: skipNextCanvasClickClear as { value: boolean },
    editingText,
    setEditingText: (next) => helpers.setEditingText(next),
    editingInputRef,
    draggingHandle,
    setDraggingHandle: (next) => helpers.setDraggingHandle(next),
    draggingPolylinePoint,
    setDraggingPolylinePoint: (next) => helpers.setDraggingPolylinePoint(next),
    activePortHighlight,
    setActivePortHighlight: (next) => helpers.setActivePortHighlight(next),
    hoveredShapeId,
    setHoveredShapeId: (next) => helpers.setHoveredShapeId(next),
    resizeHandlesRef: resizeHandlesRef as { value: Map<string, SVGRectElement[]> },
    cornerHandlesRef: cornerHandlesRef as { value: Map<string, SVGRectElement[]> },
    textSelectionRef: textSelectionRef as { value: Map<string, SVGRectElement> },
    handleConnectionRef: handleConnectionRef as { value: boolean },
    lastPointerRef: lastPointerRef as { value: { x: number; y: number; clientX: number; clientY: number } },
    copyBufferRef: copyBufferRef as { value: { ids: string[]; shapes: SVGShape[] } | null },
    draggingCornerHandle,
    setDraggingCornerHandle: (next) => helpers.setDraggingCornerHandle(next),
    viewBoxMinX,
    viewBoxMinY,
    viewBoxMaxX,
    viewBoxMaxY,
    getPointerPosition,
    lastBoundsRef: lastBoundsRef as {
      value: { minX: number; minY: number; maxX: number; maxY: number } | null;
    },
  };
};
