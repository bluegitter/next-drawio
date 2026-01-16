import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CanvasComponentProps, CanvasComponentRef, HistoryState, ResizeHandle, SVGShape } from '../types';

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
  setSelectedShapes: (ids: string[]) => void;
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
  portElementsRef: React.MutableRefObject<Map<string, SVGElement[]>>;
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
  editingInputRef: React.MutableRefObject<HTMLInputElement | null>;
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
  resizeHandlesRef: React.MutableRefObject<Map<string, SVGElement[]>>;
  cornerHandlesRef: React.MutableRefObject<Map<string, SVGElement[]>>;
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
  const {
    width,
    height,
    pageWidth,
    pageOffsetXPages,
    pageHeight,
    pageOffsetYPages,
  } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const [shapes, setShapes] = useState<SVGShape[]>([]);
  const shapesRef = useRef<SVGShape[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectedIdsRef = useRef<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryState[]>([{ shapes: [], selectedIds: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelectingBox, setIsSelectingBox] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const selectionOriginRef = useRef<{ x: number; y: number } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [connectionStartPort, setConnectionStartPort] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [tempLine, setTempLine] = useState<SVGElement | null>(null);
  const shapeIdCounter = useRef(0);
  const hasCalledReady = useRef(false);
  const methodsRef = useRef<CanvasComponentRef | null>(null);
  const portElementsRef = useRef<Map<string, SVGElement[]>>(new Map());
  const connectorHandleRef = useRef<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>(new Map());
  const skipNextCanvasClickClear = useRef(false);
  const [editingText, setEditingText] = useState<CanvasState['editingText']>(null);
  const editingInputRef = useRef<HTMLInputElement | null>(null);
  const [draggingHandle, setDraggingHandle] = useState<CanvasState['draggingHandle']>(null);
  const [draggingPolylinePoint, setDraggingPolylinePoint] = useState<CanvasState['draggingPolylinePoint']>(null);
  const [activePortHighlight, setActivePortHighlight] = useState<CanvasState['activePortHighlight']>(null);
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);
  const resizeHandlesRef = useRef<Map<string, SVGElement[]>>(new Map());
  const cornerHandlesRef = useRef<Map<string, SVGElement[]>>(new Map());
  const textSelectionRef = useRef<Map<string, SVGRectElement>>(new Map());
  const handleConnectionRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const copyBufferRef = useRef<{ ids: string[]; shapes: SVGShape[] } | null>(null);
  const [draggingCornerHandle, setDraggingCornerHandle] = useState<CanvasState['draggingCornerHandle']>(null);

  const viewBoxMinX = useMemo(() => -(pageOffsetXPages || 0) * (pageWidth || 0), [pageOffsetXPages, pageWidth]);
  const viewBoxMinY = useMemo(() => -(pageOffsetYPages || 0) * (pageHeight || 0), [pageHeight, pageOffsetYPages]);
  const viewBoxMaxX = useMemo(() => viewBoxMinX + width, [viewBoxMinX, width]);
  const viewBoxMaxY = useMemo(() => viewBoxMinY + height, [viewBoxMinY, height]);

  const getPointerPosition = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX + viewBoxMinX,
      y: (clientY - rect.top) * scaleY + viewBoxMinY,
    };
  }, [height, width, viewBoxMinX, viewBoxMinY]);

  const lastBoundsRef = useRef<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null);
  const selectedShape = useMemo(() => {
    const first = selectedIds.values().next();
    return first.done ? null : first.value;
  }, [selectedIds]);

  const setSelectedShape = useCallback((id: string | null) => {
    const next = id ? new Set([id]) : new Set<string>();
    selectedIdsRef.current = next;
    setSelectedIds(next);
  }, []);

  const setSelectedShapes = useCallback((ids: string[]) => {
    const next = new Set(ids);
    selectedIdsRef.current = next;
    setSelectedIds(next);
  }, []);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  const setShapesState = useCallback((updater: (prev: SVGShape[]) => SVGShape[]) => {
    setShapes(prev => {
      const next = updater(prev);
      shapesRef.current = next;
      return next;
    });
  }, []);

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
