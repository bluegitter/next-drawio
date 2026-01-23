import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CanvasComponentProps, CanvasComponentRef, HistoryState, SVGShape } from '../types';
import { createCanvasState, useCanvasState as useCanvasStateCore } from '@drawio/core';

export interface CanvasState {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  shapesRef: React.MutableRefObject<SVGShape[]>;
  setShapes: React.Dispatch<React.SetStateAction<SVGShape[]>>;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedIdsRef: React.MutableRefObject<Set<string>>;
  selectedShape: string | null;
  setSelectedShape: (id: string | null) => void;
  setSelectedShapes: (ids: string[] | Set<string>) => void;
  history: HistoryState[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>;
  historyIndex: number;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  isResizing: boolean;
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
  isSelectingBox: boolean;
  setIsSelectingBox: React.Dispatch<React.SetStateAction<boolean>>;
  selectionRect: { x: number; y: number; w: number; h: number } | null;
  setSelectionRect: React.Dispatch<React.SetStateAction<{ x: number; y: number; w: number; h: number } | null>>;
  selectionOriginRef: React.MutableRefObject<{ x: number; y: number } | null>;
  isConnecting: boolean;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  connectionStart: string | null;
  setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
  connectionStartPort: string | null;
  setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
  dragStart: { x: number; y: number };
  setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  resizeHandle: string | null;
  setResizeHandle: React.Dispatch<React.SetStateAction<string | null>>;
  tempLine: SVGElement | null;
  setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
  shapeIdCounter: React.MutableRefObject<number>;
  hasCalledReady: React.MutableRefObject<boolean>;
  methodsRef: React.MutableRefObject<CanvasComponentRef | null>;
  portElementsRef: React.MutableRefObject<Map<string, SVGCircleElement[]>>;
  connectorHandleRef: React.MutableRefObject<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>;
  skipNextCanvasClickClear: React.MutableRefObject<boolean>;
  editingText: {
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
  setEditingText: React.Dispatch<React.SetStateAction<CanvasState['editingText']>>;
  editingInputRef: React.RefObject<HTMLInputElement>;
  draggingHandle: {
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
  setDraggingHandle: React.Dispatch<React.SetStateAction<CanvasState['draggingHandle']>>;
  draggingPolylinePoint: { shapeId: string; index: number } | null;
  setDraggingPolylinePoint: React.Dispatch<React.SetStateAction<CanvasState['draggingPolylinePoint']>>;
  activePortHighlight: { shapeId: string; portId: string } | null;
  setActivePortHighlight: React.Dispatch<React.SetStateAction<CanvasState['activePortHighlight']>>;
  hoveredShapeId: string | null;
  setHoveredShapeId: React.Dispatch<React.SetStateAction<string | null>>;
  resizeHandlesRef: React.MutableRefObject<Map<string, SVGRectElement[]>>;
  cornerHandlesRef: React.MutableRefObject<Map<string, SVGRectElement[]>>;
  textSelectionRef: React.MutableRefObject<Map<string, SVGRectElement>>;
  handleConnectionRef: React.MutableRefObject<boolean>;
  lastPointerRef: React.MutableRefObject<{ x: number; y: number; clientX: number; clientY: number }>;
  copyBufferRef: React.MutableRefObject<{ ids: string[]; shapes: SVGShape[] } | null>;
  draggingCornerHandle: { shapeId: string; handleType: string; startCornerRadius: number } | null;
  setDraggingCornerHandle: React.Dispatch<React.SetStateAction<CanvasState['draggingCornerHandle']>>;
  viewBoxMinX: number;
  viewBoxMinY: number;
  viewBoxMaxX: number;
  viewBoxMaxY: number;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  lastBoundsRef: React.MutableRefObject<{ minX: number; minY: number; maxX: number; maxY: number } | null>;
}

export const useCanvasState = (props: CanvasComponentProps): CanvasState => {
  const coreStateRef = useRef(createCanvasState(props));
  const coreState = coreStateRef.current;

  const svgRef = useRef<SVGSVGElement>(null as unknown as SVGSVGElement);
  const [shapes, setShapesState] = useState<SVGShape[]>(coreState.shapes);
  const shapesRef = useRef<SVGShape[]>(coreState.shapes);
  const [selectedIds, setSelectedIdsState] = useState<Set<string>>(coreState.selectedIds);
  const selectedIdsRef = useRef<Set<string>>(coreState.selectedIds);
  const [history, setHistoryState] = useState<HistoryState[]>(coreState.history);
  const [historyIndex, setHistoryIndexState] = useState(coreState.historyIndex);
  const [zoom, setZoomState] = useState(coreState.zoom);
  const [isDragging, setIsDraggingState] = useState(coreState.isDragging);
  const [isResizing, setIsResizingState] = useState(coreState.isResizing);
  const [isSelectingBox, setIsSelectingBoxState] = useState(coreState.isSelectingBox);
  const [selectionRect, setSelectionRectState] = useState<{ x: number; y: number; w: number; h: number } | null>(
    coreState.selectionRect
  );
  const selectionOriginRef = useRef<{ x: number; y: number } | null>(coreState.selectionOrigin);
  const [isConnecting, setIsConnectingState] = useState(coreState.isConnecting);
  const [connectionStart, setConnectionStartState] = useState<string | null>(coreState.connectionStart);
  const [connectionStartPort, setConnectionStartPortState] = useState<string | null>(coreState.connectionStartPort);
  const [dragStart, setDragStartState] = useState(coreState.dragStart);
  const [resizeHandle, setResizeHandleState] = useState<string | null>(coreState.resizeHandle);
  const [tempLine, setTempLineState] = useState<SVGElement | null>(coreState.tempLine);
  const shapeIdCounter = useRef(0);
  const hasCalledReady = useRef(false);
  const methodsRef = useRef<CanvasComponentRef | null>(null);
  const portElementsRef = useRef<Map<string, SVGCircleElement[]>>(new Map());
  const connectorHandleRef = useRef<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>(new Map());
  const skipNextCanvasClickClear = useRef(false);
  const [editingText, setEditingTextState] = useState<CanvasState['editingText']>(coreState.editingText);
  const editingInputRef = useRef<HTMLInputElement>(null as unknown as HTMLInputElement);
  const [draggingHandle, setDraggingHandleState] = useState<CanvasState['draggingHandle']>(coreState.draggingHandle);
  const [draggingPolylinePoint, setDraggingPolylinePointState] = useState<CanvasState['draggingPolylinePoint']>(
    coreState.draggingPolylinePoint
  );
  const [activePortHighlight, setActivePortHighlightState] = useState<CanvasState['activePortHighlight']>(
    coreState.activePortHighlight
  );
  const [hoveredShapeId, setHoveredShapeIdState] = useState<string | null>(coreState.hoveredShapeId);
  const resizeHandlesRef = useRef<Map<string, SVGRectElement[]>>(new Map());
  const cornerHandlesRef = useRef<Map<string, SVGRectElement[]>>(new Map());
  const textSelectionRef = useRef<Map<string, SVGRectElement>>(new Map());
  const handleConnectionRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const copyBufferRef = useRef<{ ids: string[]; shapes: SVGShape[] } | null>(null);
  const lastBoundsRef = useRef<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null);
  const [draggingCornerHandle, setDraggingCornerHandleState] = useState<CanvasState['draggingCornerHandle']>(
    coreState.draggingCornerHandle
  );

  const helpers = useCanvasStateCore({
    props,
    coreState,
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

  useEffect(() => {
    helpers.syncProps();
  }, [helpers, props]);

  useEffect(() => {
    helpers.syncRefs();
  });

  const viewBoxMinX = useMemo(() => coreState.getViewBoxBounds().minX, [coreState, props]);
  const viewBoxMinY = useMemo(() => coreState.getViewBoxBounds().minY, [coreState, props]);
  const viewBoxMaxX = useMemo(() => coreState.getViewBoxBounds().maxX, [coreState, props]);
  const viewBoxMaxY = useMemo(() => coreState.getViewBoxBounds().maxY, [coreState, props]);

  const getPointerPosition = useCallback(
    (clientX: number, clientY: number) => helpers.getPointerPosition(clientX, clientY),
    [helpers]
  );

  const selectedShape = useMemo(() => {
    const first = selectedIds.values().next();
    return first.done ? null : first.value;
  }, [selectedIds]);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  return {
    svgRef,
    shapes,
    shapesRef,
    setShapes: helpers.setShapes,
    selectedIds,
    setSelectedIds: helpers.setSelectedIds,
    selectedIdsRef,
    selectedShape,
    setSelectedShape: helpers.setSelectedShape,
    setSelectedShapes: helpers.setSelectedShapes,
    history,
    setHistory: helpers.setHistory,
    historyIndex,
    setHistoryIndex: helpers.setHistoryIndex,
    zoom,
    setZoom: helpers.setZoom,
    isDragging,
    setIsDragging: helpers.setIsDragging,
    isResizing,
    setIsResizing: helpers.setIsResizing,
    isSelectingBox,
    setIsSelectingBox: helpers.setIsSelectingBox,
    selectionRect,
    setSelectionRect: helpers.setSelectionRect,
    selectionOriginRef,
    isConnecting,
    setIsConnecting: helpers.setIsConnecting,
    connectionStart,
    setConnectionStart: helpers.setConnectionStart,
    connectionStartPort,
    setConnectionStartPort: helpers.setConnectionStartPort,
    dragStart,
    setDragStart: helpers.setDragStart,
    resizeHandle,
    setResizeHandle: helpers.setResizeHandle,
    tempLine,
    setTempLine: helpers.setTempLine,
    shapeIdCounter,
    hasCalledReady,
    methodsRef,
    portElementsRef,
    connectorHandleRef,
    skipNextCanvasClickClear,
    editingText,
    setEditingText: helpers.setEditingText,
    editingInputRef,
    draggingHandle,
    setDraggingHandle: helpers.setDraggingHandle,
    draggingPolylinePoint,
    setDraggingPolylinePoint: helpers.setDraggingPolylinePoint,
    activePortHighlight,
    setActivePortHighlight: helpers.setActivePortHighlight,
    hoveredShapeId,
    setHoveredShapeId: helpers.setHoveredShapeId,
    resizeHandlesRef,
    cornerHandlesRef,
    textSelectionRef,
    handleConnectionRef,
    lastPointerRef,
    copyBufferRef,
    draggingCornerHandle,
    setDraggingCornerHandle: helpers.setDraggingCornerHandle,
    viewBoxMinX,
    viewBoxMinY,
    viewBoxMaxX,
    viewBoxMaxY,
    getPointerPosition,
    lastBoundsRef,
  };
};
