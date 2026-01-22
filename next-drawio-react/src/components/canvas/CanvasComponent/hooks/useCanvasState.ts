import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CanvasComponentProps, CanvasComponentRef, HistoryState, SVGShape } from '../types';
import { createCanvasState } from '@drawio/core';

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
  const [draggingCornerHandle, setDraggingCornerHandleState] = useState<CanvasState['draggingCornerHandle']>(
    coreState.draggingCornerHandle
  );

  useEffect(() => {
    coreState.setProps(props);
  }, [coreState, props]);

  useEffect(() => {
    coreState.svg = svgRef.current;
    coreState.editingInput = editingInputRef.current;
    coreState.selectionOrigin = selectionOriginRef.current;
    coreState.lastBounds = lastBoundsRef.current;
    coreState.shapeIdCounter = shapeIdCounter.current;
    coreState.hasCalledReady = hasCalledReady.current;
    coreState.methodsRef = methodsRef.current;
    coreState.portElements = portElementsRef.current;
    coreState.connectorHandle = connectorHandleRef.current;
    coreState.skipNextCanvasClickClear = skipNextCanvasClickClear.current;
    coreState.resizeHandles = resizeHandlesRef.current;
    coreState.cornerHandles = cornerHandlesRef.current;
    coreState.textSelection = textSelectionRef.current;
    coreState.handleConnection = handleConnectionRef.current;
    coreState.lastPointer = lastPointerRef.current;
    coreState.copyBuffer = copyBufferRef.current;
  });

  const viewBoxMinX = useMemo(() => coreState.getViewBoxBounds().minX, [coreState, props]);
  const viewBoxMinY = useMemo(() => coreState.getViewBoxBounds().minY, [coreState, props]);
  const viewBoxMaxX = useMemo(() => coreState.getViewBoxBounds().maxX, [coreState, props]);
  const viewBoxMaxY = useMemo(() => coreState.getViewBoxBounds().maxY, [coreState, props]);

  const getPointerPosition = useCallback(
    (clientX: number, clientY: number) => coreState.getPointerPosition(clientX, clientY),
    [coreState]
  );

  const lastBoundsRef = useRef<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null);
  const selectedShape = useMemo(() => {
    const first = selectedIds.values().next();
    return first.done ? null : first.value;
  }, [selectedIds]);

  const setSelectedShape = useCallback((id: string | null) => {
    const next = id ? new Set([id]) : new Set<string>();
    coreState.selectedIds = next;
    selectedIdsRef.current = next;
    setSelectedIdsState(next);
  }, [coreState]);

  const setSelectedShapes = useCallback((ids: string[] | Set<string>) => {
    const next = new Set(ids);
    coreState.selectedIds = next;
    selectedIdsRef.current = next;
    setSelectedIdsState(next);
  }, [coreState]);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  const setShapes = useCallback((updater: React.SetStateAction<SVGShape[]>) => {
    setShapesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.shapes = next;
      shapesRef.current = next;
      return next;
    });
  }, [coreState]);

  const setSelectedIds = useCallback((updater: React.SetStateAction<Set<string>>) => {
    setSelectedIdsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.selectedIds = next;
      selectedIdsRef.current = next;
      return next;
    });
  }, [coreState]);

  const setHistory = useCallback((updater: React.SetStateAction<HistoryState[]>) => {
    setHistoryState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.history = next;
      return next;
    });
  }, [coreState]);

  const setHistoryIndex = useCallback((updater: React.SetStateAction<number>) => {
    setHistoryIndexState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.historyIndex = next;
      return next;
    });
  }, [coreState]);

  const setZoom = useCallback((updater: React.SetStateAction<number>) => {
    setZoomState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.zoom = next;
      return next;
    });
  }, [coreState]);

  const setIsDragging = useCallback((updater: React.SetStateAction<boolean>) => {
    setIsDraggingState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.isDragging = next;
      return next;
    });
  }, [coreState]);

  const setIsResizing = useCallback((updater: React.SetStateAction<boolean>) => {
    setIsResizingState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.isResizing = next;
      return next;
    });
  }, [coreState]);

  const setIsSelectingBox = useCallback((updater: React.SetStateAction<boolean>) => {
    setIsSelectingBoxState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.isSelectingBox = next;
      return next;
    });
  }, [coreState]);

  const setSelectionRect = useCallback((updater: React.SetStateAction<{ x: number; y: number; w: number; h: number } | null>) => {
    setSelectionRectState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.selectionRect = next;
      return next;
    });
  }, [coreState]);

  const setIsConnecting = useCallback((updater: React.SetStateAction<boolean>) => {
    setIsConnectingState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.isConnecting = next;
      return next;
    });
  }, [coreState]);

  const setConnectionStart = useCallback((updater: React.SetStateAction<string | null>) => {
    setConnectionStartState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.connectionStart = next;
      return next;
    });
  }, [coreState]);

  const setConnectionStartPort = useCallback((updater: React.SetStateAction<string | null>) => {
    setConnectionStartPortState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.connectionStartPort = next;
      return next;
    });
  }, [coreState]);

  const setDragStart = useCallback((updater: React.SetStateAction<{ x: number; y: number }>) => {
    setDragStartState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.dragStart = next;
      return next;
    });
  }, [coreState]);

  const setResizeHandle = useCallback((updater: React.SetStateAction<string | null>) => {
    setResizeHandleState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.resizeHandle = next;
      return next;
    });
  }, [coreState]);

  const setTempLine = useCallback((updater: React.SetStateAction<SVGElement | null>) => {
    setTempLineState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.tempLine = next;
      return next;
    });
  }, [coreState]);

  const setEditingText = useCallback((updater: React.SetStateAction<CanvasState['editingText']>) => {
    setEditingTextState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.editingText = next;
      return next;
    });
  }, [coreState]);

  const setDraggingHandle = useCallback((updater: React.SetStateAction<CanvasState['draggingHandle']>) => {
    setDraggingHandleState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.draggingHandle = next;
      return next;
    });
  }, [coreState]);

  const setDraggingPolylinePoint = useCallback((updater: React.SetStateAction<CanvasState['draggingPolylinePoint']>) => {
    setDraggingPolylinePointState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.draggingPolylinePoint = next;
      return next;
    });
  }, [coreState]);

  const setActivePortHighlight = useCallback((updater: React.SetStateAction<CanvasState['activePortHighlight']>) => {
    setActivePortHighlightState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.activePortHighlight = next;
      return next;
    });
  }, [coreState]);

  const setHoveredShapeId = useCallback((updater: React.SetStateAction<string | null>) => {
    setHoveredShapeIdState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.hoveredShapeId = next;
      return next;
    });
  }, [coreState]);

  const setDraggingCornerHandle = useCallback((updater: React.SetStateAction<CanvasState['draggingCornerHandle']>) => {
    setDraggingCornerHandleState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.draggingCornerHandle = next;
      return next;
    });
  }, [coreState]);

  return {
    svgRef,
    shapes,
    shapesRef,
    setShapes,
    selectedIds,
    setSelectedIds,
    selectedIdsRef,
    selectedShape,
    setSelectedShape,
    setSelectedShapes,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    zoom,
    setZoom,
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    isSelectingBox,
    setIsSelectingBox,
    selectionRect,
    setSelectionRect,
    selectionOriginRef,
    isConnecting,
    setIsConnecting,
    connectionStart,
    setConnectionStart,
    connectionStartPort,
    setConnectionStartPort,
    dragStart,
    setDragStart,
    resizeHandle,
    setResizeHandle,
    tempLine,
    setTempLine,
    shapeIdCounter,
    hasCalledReady,
    methodsRef,
    portElementsRef,
    connectorHandleRef,
    skipNextCanvasClickClear,
    editingText,
    setEditingText,
    editingInputRef,
    draggingHandle,
    setDraggingHandle,
    draggingPolylinePoint,
    setDraggingPolylinePoint,
    activePortHighlight,
    setActivePortHighlight,
    hoveredShapeId,
    setHoveredShapeId,
    resizeHandlesRef,
    cornerHandlesRef,
    textSelectionRef,
    handleConnectionRef,
    lastPointerRef,
    copyBufferRef,
    draggingCornerHandle,
    setDraggingCornerHandle,
    viewBoxMinX,
    viewBoxMinY,
    viewBoxMaxX,
    viewBoxMaxY,
    getPointerPosition,
    lastBoundsRef,
  };
};
