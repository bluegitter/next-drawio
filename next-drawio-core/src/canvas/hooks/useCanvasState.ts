import type { CanvasComponentProps, CanvasComponentRef, HistoryState, SVGShape } from '../types';
import type { CanvasState } from '../state';
import type { RefLike } from '../../utils/refs';
import { getRefValue, setRefValue } from '../../utils/refs';

export type UseCanvasStateArgs = {
  props: CanvasComponentProps;
  coreState: CanvasState;
  refs: {
    svgRef: RefLike<SVGSVGElement>;
    editingInputRef: RefLike<HTMLInputElement>;
    selectionOriginRef: RefLike<{ x: number; y: number } | null>;
    lastBoundsRef: RefLike<{ minX: number; minY: number; maxX: number; maxY: number } | null>;
    shapeIdCounter: RefLike<number>;
    hasCalledReady: RefLike<boolean>;
    methodsRef: RefLike<CanvasComponentRef | null>;
    portElementsRef: RefLike<Map<string, SVGCircleElement[]>>;
    connectorHandleRef: RefLike<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>;
    skipNextCanvasClickClear: RefLike<boolean>;
    resizeHandlesRef: RefLike<Map<string, SVGRectElement[]>>;
    cornerHandlesRef: RefLike<Map<string, SVGRectElement[]>>;
    textSelectionRef: RefLike<Map<string, SVGRectElement>>;
    handleConnectionRef: RefLike<boolean>;
    lastPointerRef: RefLike<{ x: number; y: number; clientX: number; clientY: number }>;
    copyBufferRef: RefLike<{ ids: string[]; shapes: SVGShape[] } | null>;
  };
  shapesRef: RefLike<SVGShape[]>;
  selectedIdsRef: RefLike<Set<string>>;
  setters: {
    setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
    setSelectedIdsState: (updater: (prev: Set<string>) => Set<string>) => void;
    setHistoryState: (updater: (prev: HistoryState[]) => HistoryState[]) => void;
    setHistoryIndexState: (updater: (prev: number) => number) => void;
    setZoomState: (updater: (prev: number) => number) => void;
    setIsDraggingState: (updater: (prev: boolean) => boolean) => void;
    setIsResizingState: (updater: (prev: boolean) => boolean) => void;
    setIsSelectingBoxState: (updater: (prev: boolean) => boolean) => void;
    setSelectionRectState: (updater: (prev: { x: number; y: number; w: number; h: number } | null) => { x: number; y: number; w: number; h: number } | null) => void;
    setIsConnectingState: (updater: (prev: boolean) => boolean) => void;
    setConnectionStartState: (updater: (prev: string | null) => string | null) => void;
    setConnectionStartPortState: (updater: (prev: string | null) => string | null) => void;
    setDragStartState: (updater: (prev: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => void;
    setResizeHandleState: (updater: (prev: string | null) => string | null) => void;
    setTempLineState: (updater: (prev: SVGElement | null) => SVGElement | null) => void;
    setEditingTextState: (updater: (prev: CanvasState['editingText']) => CanvasState['editingText']) => void;
    setDraggingHandleState: (updater: (prev: CanvasState['draggingHandle']) => CanvasState['draggingHandle']) => void;
    setDraggingPolylinePointState: (updater: (prev: CanvasState['draggingPolylinePoint']) => CanvasState['draggingPolylinePoint']) => void;
    setActivePortHighlightState: (updater: (prev: CanvasState['activePortHighlight']) => CanvasState['activePortHighlight']) => void;
    setHoveredShapeIdState: (updater: (prev: string | null) => string | null) => void;
    setDraggingCornerHandleState: (updater: (prev: CanvasState['draggingCornerHandle']) => CanvasState['draggingCornerHandle']) => void;
  };
};

const applyUpdater = <T>(setter: (updater: (prev: T) => T) => void, next: T | ((prev: T) => T)) => {
  setter((prev) => (typeof next === 'function' ? (next as (p: T) => T)(prev) : next));
};

export const useCanvasState = ({ props, coreState, refs, shapesRef, selectedIdsRef, setters }: UseCanvasStateArgs) => {
  const syncProps = () => {
    coreState.setProps(props);
  };

  const syncRefs = () => {
    coreState.svg = getRefValue(refs.svgRef);
    coreState.editingInput = getRefValue(refs.editingInputRef);
    coreState.selectionOrigin = getRefValue(refs.selectionOriginRef);
    coreState.lastBounds = getRefValue(refs.lastBoundsRef);
    coreState.shapeIdCounter = getRefValue(refs.shapeIdCounter) ?? 0;
    coreState.hasCalledReady = Boolean(getRefValue(refs.hasCalledReady));
    coreState.methodsRef = getRefValue(refs.methodsRef);
    coreState.portElements = getRefValue(refs.portElementsRef) ?? new Map();
    coreState.connectorHandle = getRefValue(refs.connectorHandleRef) ?? new Map();
    coreState.skipNextCanvasClickClear = Boolean(getRefValue(refs.skipNextCanvasClickClear));
    coreState.resizeHandles = getRefValue(refs.resizeHandlesRef) ?? new Map();
    coreState.cornerHandles = getRefValue(refs.cornerHandlesRef) ?? new Map();
    coreState.textSelection = getRefValue(refs.textSelectionRef) ?? new Map();
    coreState.handleConnection = Boolean(getRefValue(refs.handleConnectionRef));
    coreState.lastPointer = getRefValue(refs.lastPointerRef) ?? { x: 0, y: 0, clientX: 0, clientY: 0 };
    coreState.copyBuffer = getRefValue(refs.copyBufferRef);
  };

  const getPointerPosition = (clientX: number, clientY: number) => coreState.getPointerPosition(clientX, clientY);

  const setSelectedShape = (id: string | null) => {
    const next = id ? new Set([id]) : new Set<string>();
    coreState.selectedIds = next;
    setRefValue(selectedIdsRef, next);
    setters.setSelectedIdsState(() => next);
  };

  const setSelectedShapes = (ids: string[] | Set<string>) => {
    const next = new Set(ids);
    coreState.selectedIds = next;
    setRefValue(selectedIdsRef, next);
    setters.setSelectedIdsState(() => next);
  };

  const setShapes = (updater: SVGShape[] | ((prev: SVGShape[]) => SVGShape[])) => {
    applyUpdater(setters.setShapesState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.shapes = next;
      setRefValue(shapesRef, next);
      return next;
    });
  };

  const setSelectedIds = (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    applyUpdater(setters.setSelectedIdsState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.selectedIds = next;
      setRefValue(selectedIdsRef, next);
      return next;
    });
  };

  const setHistory = (updater: HistoryState[] | ((prev: HistoryState[]) => HistoryState[])) => {
    applyUpdater(setters.setHistoryState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.history = next;
      return next;
    });
  };

  const setHistoryIndex = (updater: number | ((prev: number) => number)) => {
    applyUpdater(setters.setHistoryIndexState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.historyIndex = next;
      return next;
    });
  };

  const setZoom = (updater: number | ((prev: number) => number)) => {
    applyUpdater(setters.setZoomState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.zoom = next;
      return next;
    });
  };

  const setIsDragging = (updater: boolean | ((prev: boolean) => boolean)) => {
    applyUpdater(setters.setIsDraggingState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.isDragging = next;
      return next;
    });
  };

  const setIsResizing = (updater: boolean | ((prev: boolean) => boolean)) => {
    applyUpdater(setters.setIsResizingState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.isResizing = next;
      return next;
    });
  };

  const setIsSelectingBox = (updater: boolean | ((prev: boolean) => boolean)) => {
    applyUpdater(setters.setIsSelectingBoxState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.isSelectingBox = next;
      return next;
    });
  };

  const setSelectionRect = (
    updater:
      | { x: number; y: number; w: number; h: number }
      | null
      | ((prev: { x: number; y: number; w: number; h: number } | null) => { x: number; y: number; w: number; h: number } | null)
  ) => {
    applyUpdater(setters.setSelectionRectState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.selectionRect = next;
      return next;
    });
  };

  const setIsConnecting = (updater: boolean | ((prev: boolean) => boolean)) => {
    applyUpdater(setters.setIsConnectingState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.isConnecting = next;
      return next;
    });
  };

  const setConnectionStart = (updater: string | null | ((prev: string | null) => string | null)) => {
    applyUpdater(setters.setConnectionStartState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.connectionStart = next;
      return next;
    });
  };

  const setConnectionStartPort = (updater: string | null | ((prev: string | null) => string | null)) => {
    applyUpdater(setters.setConnectionStartPortState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.connectionStartPort = next;
      return next;
    });
  };

  const setDragStart = (
    updater:
      | { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }
      | ((prev: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number })
  ) => {
    applyUpdater(setters.setDragStartState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.dragStart = next;
      return next;
    });
  };

  const setResizeHandle = (updater: string | null | ((prev: string | null) => string | null)) => {
    applyUpdater(setters.setResizeHandleState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.resizeHandle = next;
      return next;
    });
  };

  const setTempLine = (updater: SVGElement | null | ((prev: SVGElement | null) => SVGElement | null)) => {
    applyUpdater(setters.setTempLineState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.tempLine = next;
      return next;
    });
  };

  const setEditingText = (updater: CanvasState['editingText'] | ((prev: CanvasState['editingText']) => CanvasState['editingText'])) => {
    applyUpdater(setters.setEditingTextState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.editingText = next;
      return next;
    });
  };

  const setDraggingHandle = (updater: CanvasState['draggingHandle'] | ((prev: CanvasState['draggingHandle']) => CanvasState['draggingHandle'])) => {
    applyUpdater(setters.setDraggingHandleState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.draggingHandle = next;
      return next;
    });
  };

  const setDraggingPolylinePoint = (
    updater: CanvasState['draggingPolylinePoint'] | ((prev: CanvasState['draggingPolylinePoint']) => CanvasState['draggingPolylinePoint'])
  ) => {
    applyUpdater(setters.setDraggingPolylinePointState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.draggingPolylinePoint = next;
      return next;
    });
  };

  const setActivePortHighlight = (
    updater: CanvasState['activePortHighlight'] | ((prev: CanvasState['activePortHighlight']) => CanvasState['activePortHighlight'])
  ) => {
    applyUpdater(setters.setActivePortHighlightState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.activePortHighlight = next;
      return next;
    });
  };

  const setHoveredShapeId = (updater: string | null | ((prev: string | null) => string | null)) => {
    applyUpdater(setters.setHoveredShapeIdState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.hoveredShapeId = next;
      return next;
    });
  };

  const setDraggingCornerHandle = (
    updater: CanvasState['draggingCornerHandle'] | ((prev: CanvasState['draggingCornerHandle']) => CanvasState['draggingCornerHandle'])
  ) => {
    applyUpdater(setters.setDraggingCornerHandleState, (prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      coreState.draggingCornerHandle = next;
      return next;
    });
  };

  return {
    syncProps,
    syncRefs,
    getPointerPosition,
    setSelectedShape,
    setSelectedShapes,
    setShapes,
    setSelectedIds,
    setHistory,
    setHistoryIndex,
    setZoom,
    setIsDragging,
    setIsResizing,
    setIsSelectingBox,
    setSelectionRect,
    setIsConnecting,
    setConnectionStart,
    setConnectionStartPort,
    setDragStart,
    setResizeHandle,
    setTempLine,
    setEditingText,
    setDraggingHandle,
    setDraggingPolylinePoint,
    setActivePortHighlight,
    setHoveredShapeId,
    setDraggingCornerHandle,
  };
};
