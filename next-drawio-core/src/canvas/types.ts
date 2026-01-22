export interface CanvasComponentRef {
  addRectangle: () => void;
  addRoundedRect: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addPolyline: () => void;
  addText: () => void;
  addSvgIcon: (href: string, options?: { width?: number; height?: number; position?: { x: number; y: number }; iconName?: string }) => void;
  addShapeAt: (type: string, position: { x: number; y: number }) => void;
  setZoom: (zoom: number) => number;
  zoomIn: (factor?: number) => number;
  zoomOut: (factor?: number) => number;
  getZoom: () => number;
  copySelection: () => void;
  pasteClipboard: () => void;
  hasClipboard: () => boolean;
  combineSelected: () => void;
  ungroupSelected: () => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  clearCanvas: () => void;
  exportCanvas: (format: 'png' | 'jpg' | 'svg') => void;
  getCanvas: () => SVGSVGElement | null;
  getSelectedShape: (selectedShapeId?: string | null | undefined) => SVGElement | null;
  getSelectionCount: () => number;
  exportJson: () => string;
  importJson: (payload: string) => void;
  duplicateSelected: (ids?: Set<string> | string[]) => { ids: string[]; mergedShapes: SVGShape[] } | void;
  bringToFront: () => void;
  sendToBack: () => void;
  moveForward: () => void;
  moveBackward: () => void;
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
  undo: () => void;
  redo: () => void;
  startConnection: (fromShape: string, fromPortId?: string) => void;
  connectShapes: (fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export interface CanvasComponentProps {
  width: number;
  height: number;
  backgroundColor?: string;
  onReady?: (canvas: SVGSVGElement, methods: CanvasComponentRef) => void;
  onError?: (error: Error) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
  onCanvasChange?: () => void;
  autoResize?: boolean;
  onClipboardChange?: (hasClipboard: boolean) => void;
  onBoundsChange?: (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => void;
  pageWidth?: number;
  pageCountX?: number;
  pageHeight?: number;
  pageCountY?: number;
  pageOffsetXPages?: number;
  pageOffsetYPages?: number;
  enableConnectorNodeSnap?: boolean;
  connectorNodeSnapDistance?: number;
  connectorNodeAlignDistance?: number;
  disableSelectionBox?: boolean;
  disableShapeSelection?: boolean;
  disableShapeHover?: boolean;
}

export interface SVGShape {
  id: string;
  type: 'rect' | 'roundedRect' | 'circle' | 'triangle' | 'line' | 'polyline' | 'text' | 'connector' | 'image' | 'diamond' | 'trapezoid' | 'hexagon' | 'pentagon' | 'speech' | 'wave' | 'cloud' | 'ellipse' | 'cylinder';
  element: SVGElement;
  data: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    cornerRadius?: number;
    points?: string;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    letterSpacing?: string;
    lineHeight?: string;
    startPortId?: string | null;
    endPortId?: string | null;
    groupId?: string | null;
    href?: string;
    originalHref?: string;
    originalSvgText?: string;
    iconName?: string;
    fill: string;
    stroke: string;
    strokeWidth: number;
    rotation: number;
    scale: number;
    flipX?: boolean;
    flipY?: boolean;
    opacity: number;
    arrowMode?: 'none' | 'start' | 'end' | 'both';
  };
  connections?: Array<string | null>;
}

export interface ResizeHandle {
  id: string;
  type: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  x: number;
  y: number;
  shape: SVGShape;
}

export interface HistoryState {
  shapes: SVGShape[];
  selectedIds: string[];
}
