import type { CanvasComponentProps, CanvasComponentRef, HistoryState, SVGShape } from './types';

export type EditingText = {
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

export type DraggingHandle = {
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

export type DraggingPolylinePoint = { shapeId: string; index: number } | null;
export type ActivePortHighlight = { shapeId: string; portId: string } | null;
export type DraggingCornerHandle = { shapeId: string; handleType: string; startCornerRadius: number } | null;

export type CanvasViewBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type CanvasState = {
  props: CanvasComponentProps;
  setProps: (next: Partial<CanvasComponentProps>) => void;
  svg: SVGSVGElement | null;
  shapes: SVGShape[];
  selectedIds: Set<string>;
  history: HistoryState[];
  historyIndex: number;
  zoom: number;
  isDragging: boolean;
  isResizing: boolean;
  isSelectingBox: boolean;
  selectionRect: { x: number; y: number; w: number; h: number } | null;
  selectionOrigin: { x: number; y: number } | null;
  isConnecting: boolean;
  connectionStart: string | null;
  connectionStartPort: string | null;
  dragStart: { x: number; y: number };
  resizeHandle: string | null;
  tempLine: SVGElement | null;
  shapeIdCounter: number;
  hasCalledReady: boolean;
  methodsRef: CanvasComponentRef | null;
  portElements: Map<string, SVGCircleElement[]>;
  connectorHandle: Map<string, { start: SVGCircleElement; end: SVGCircleElement }>;
  skipNextCanvasClickClear: boolean;
  editingText: EditingText;
  editingInput: HTMLInputElement | null;
  draggingHandle: DraggingHandle;
  draggingPolylinePoint: DraggingPolylinePoint;
  activePortHighlight: ActivePortHighlight;
  hoveredShapeId: string | null;
  resizeHandles: Map<string, SVGRectElement[]>;
  cornerHandles: Map<string, SVGRectElement[]>;
  textSelection: Map<string, SVGRectElement>;
  handleConnection: boolean;
  lastPointer: { x: number; y: number; clientX: number; clientY: number };
  copyBuffer: { ids: string[]; shapes: SVGShape[] } | null;
  draggingCornerHandle: DraggingCornerHandle;
  lastBounds: { minX: number; minY: number; maxX: number; maxY: number } | null;
  getViewBoxBounds: () => CanvasViewBox;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
};

const getViewBoxBounds = (props: CanvasComponentProps): CanvasViewBox => {
  const minX = -(props.pageOffsetXPages || 0) * (props.pageWidth || 0);
  const minY = -(props.pageOffsetYPages || 0) * (props.pageHeight || 0);
  return {
    minX,
    minY,
    maxX: minX + props.width,
    maxY: minY + props.height,
  };
};

export const createCanvasState = (props: CanvasComponentProps): CanvasState => {
  const state: CanvasState = {
    props: { ...props },
    setProps: (next) => {
      state.props = { ...state.props, ...next };
    },
    svg: null,
    shapes: [],
    selectedIds: new Set(),
    history: [{ shapes: [], selectedIds: [] }],
    historyIndex: 0,
    zoom: 1,
    isDragging: false,
    isResizing: false,
    isSelectingBox: false,
    selectionRect: null,
    selectionOrigin: null,
    isConnecting: false,
    connectionStart: null,
    connectionStartPort: null,
    dragStart: { x: 0, y: 0 },
    resizeHandle: null,
    tempLine: null,
    shapeIdCounter: 0,
    hasCalledReady: false,
    methodsRef: null,
    portElements: new Map(),
    connectorHandle: new Map(),
    skipNextCanvasClickClear: false,
    editingText: null,
    editingInput: null,
    draggingHandle: null,
    draggingPolylinePoint: null,
    activePortHighlight: null,
    hoveredShapeId: null,
    resizeHandles: new Map(),
    cornerHandles: new Map(),
    textSelection: new Map(),
    handleConnection: false,
    lastPointer: { x: 0, y: 0, clientX: 0, clientY: 0 },
    copyBuffer: null,
    draggingCornerHandle: null,
    lastBounds: null,
    getViewBoxBounds: () => getViewBoxBounds(state.props),
    getPointerPosition: (clientX, clientY) => {
      if (!state.svg) return { x: 0, y: 0 };
      const rect = state.svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return { x: 0, y: 0 };
      const viewBox = state.getViewBoxBounds();
      const scaleX = state.props.width / rect.width;
      const scaleY = state.props.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX + viewBox.minX,
        y: (clientY - rect.top) * scaleY + viewBox.minY,
      };
    },
  };

  return state;
};
