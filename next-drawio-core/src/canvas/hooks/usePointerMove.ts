import type { SVGShape } from '../types';
import { handleConnectorHandleDragMove } from './pointerMoveHandleDrag';
import { handleResizeMove } from './pointerMoveResize';
import { handlePolylinePointDragMove } from './pointerMovePolylinePoint';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue, setRefValue } from '../../utils/refs';

export type UsePointerMoveArgs = {
  svgRef: RefLike<SVGSVGElement>;
  shapes: MaybeRef<SVGShape[]>;
  selectedIds: MaybeRef<Set<string>>;
  draggingHandle: MaybeRef<{ connectorId: string; end: 'start' | 'end'; original: any } | null>;
  draggingPolylinePoint: MaybeRef<{ shapeId: string; index: number } | null>;
  isConnecting: MaybeRef<boolean>;
  tempLine: MaybeRef<SVGElement | null>;
  connectionStart: MaybeRef<string | null>;
  isDragging: MaybeRef<boolean>;
  isResizing: MaybeRef<boolean>;
  isSelectingBox: MaybeRef<boolean>;
  selectionOriginRef: RefLike<{ x: number; y: number }>;
  hoveredShapeId: MaybeRef<string | null>;
  activePortHighlight: MaybeRef<{ shapeId: string; portId: string } | null>;
  resizeHandle: MaybeRef<string | null>;
  selectedShape: MaybeRef<string | null>;
  draggingCornerHandle: MaybeRef<{ shapeId: string; handleType: string; startCornerRadius: number } | null>;
  dragStart: MaybeRef<{ x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }>;
  cornerHandlesRef: RefLike<Map<string, SVGRectElement[]>>;
  connectorHandleRef: RefLike<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>;
  portElementsRef: RefLike<Map<string, SVGCircleElement[]>>;
  setDragStart: (next: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => void;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectionRect: (next: { x: number; y: number; w: number; h: number } | null) => void;
  setHoveredShapeId: (next: string | null) => void;
  setActivePortHighlight: (next: { shapeId: string; portId: string } | null) => void;
  setDraggingCornerHandle: (next: { shapeId: string; handleType: string; startCornerRadius: number } | null) => void;
  updateShapePosition: (shape: SVGShape, dx: number, dy: number) => void;
  updateShapeSize: (shape: SVGShape, handle: string, dx: number, dy: number) => void;
  updateConnectionLine: (connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => void;
  updateConnectorPoints: (shape: SVGShape, points: Array<[number, number]>) => void;
  updatePolylinePoints: (shape: SVGShape, points: Array<[number, number]>) => void;
  refreshResizeHandles: (shape: SVGShape) => void;
  refreshCornerHandles: (shape: SVGShape) => void;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
  getConnectorPoints: (shape: SVGShape) => Array<[number, number]>;
  parsePoints: (points: string) => Array<[number, number]>;
  isLineConnected: (shape: SVGShape) => boolean;
  findNearestPortElement: (x: number, y: number) => SVGCircleElement | null;
  highlightPortStyle: (el: SVGCircleElement) => void;
  resetPortStyle: (el: SVGCircleElement) => void;
  showPorts: (shape: SVGShape) => void;
  hidePorts: (shapeId: string) => void;
  lastPointerRef: RefLike<{ x: number; y: number; clientX: number; clientY: number }>;
  enableConnectorNodeSnap?: boolean;
  connectorNodeSnapDistance?: number;
  connectorNodeAlignDistance?: number;
  disableShapeHover?: boolean;
  viewBoxMinX?: MaybeRef<number>;
  viewBoxMinY?: MaybeRef<number>;
};

export const usePointerMove = ({
  svgRef,
  shapes,
  selectedIds,
  draggingHandle,
  draggingPolylinePoint,
  isConnecting,
  tempLine,
  connectionStart,
  isDragging,
  isResizing,
  isSelectingBox,
  selectionOriginRef,
  hoveredShapeId,
  activePortHighlight,
  resizeHandle,
  selectedShape,
  draggingCornerHandle,
  dragStart,
  cornerHandlesRef,
  connectorHandleRef,
  portElementsRef,
  setDragStart,
  setShapesState,
  setSelectionRect,
  setHoveredShapeId,
  setActivePortHighlight,
  setDraggingCornerHandle,
  updateShapePosition,
  updateShapeSize,
  updateConnectionLine,
  updateConnectorPoints,
  updatePolylinePoints,
  refreshResizeHandles,
  refreshCornerHandles,
  getPointerPosition,
  getShapeBounds,
  getConnectorPoints,
  parsePoints,
  isLineConnected,
  findNearestPortElement,
  highlightPortStyle,
  resetPortStyle,
  showPorts,
  hidePorts,
  lastPointerRef,
  enableConnectorNodeSnap = true,
  connectorNodeSnapDistance = 14,
  connectorNodeAlignDistance = 6,
  disableShapeHover = false,
  viewBoxMinX,
  viewBoxMinY,
}: UsePointerMoveArgs) => {
  return (e: MouseEvent | PointerEvent) => {
    const svg = getRefValue(svgRef);
    if (!svg) return;

    const { x, y } = getPointerPosition(e.clientX, e.clientY);
    setRefValue(lastPointerRef, { x, y, clientX: e.clientX, clientY: e.clientY });

    if (disableShapeHover) {
      const hoveredId = getRefValue(hoveredShapeId);
      if (hoveredId) {
        hidePorts(hoveredId);
        setHoveredShapeId(null);
      }
      const activeHighlight = getRefValue(activePortHighlight);
      const portElements = getRefValue(portElementsRef);
      if (activeHighlight && portElements) {
        const prev = portElements
          .get(activeHighlight.shapeId)
          ?.find((p) => p.getAttribute('data-port-id') === activeHighlight.portId);
        if (prev) resetPortStyle(prev as SVGCircleElement);
        setActivePortHighlight(null);
      }
    }

    const shapeList = getRefValue(shapes) ?? [];
    const selected = getRefValue(selectedIds) ?? new Set<string>();
    const draggingHandleValue = getRefValue(draggingHandle);
    const draggingPolyline = getRefValue(draggingPolylinePoint);
    const dragStartValue = getRefValue(dragStart) ?? { x: 0, y: 0 };
    const connectionStartId = getRefValue(connectionStart);
    const tempLineEl = getRefValue(tempLine);
    const isConnectingValue = Boolean(getRefValue(isConnecting));
    const isDraggingValue = Boolean(getRefValue(isDragging));
    const isResizingValue = Boolean(getRefValue(isResizing));
    const isSelectingBoxValue = Boolean(getRefValue(isSelectingBox));
    const resizeHandleValue = getRefValue(resizeHandle);
    const selectedShapeValue = getRefValue(selectedShape);
    const draggingCornerValue = getRefValue(draggingCornerHandle);
    const viewBoxMinXValue = getRefValue(viewBoxMinX) ?? 0;
    const viewBoxMinYValue = getRefValue(viewBoxMinY) ?? 0;

    if (draggingHandleValue) {
      handleConnectorHandleDragMove({
        draggingHandle: draggingHandleValue,
        shapes: shapeList,
        x,
        y,
        target: e.target,
        hoveredShapeId: getRefValue(hoveredShapeId),
        activePortHighlight: getRefValue(activePortHighlight),
        connectorHandleRef,
        portElementsRef,
        setHoveredShapeId,
        setActivePortHighlight,
        getShapeBounds,
        getConnectorPoints,
        updateConnectorPoints,
        findNearestPortElement,
        highlightPortStyle,
        resetPortStyle,
        showPorts,
        hidePorts,
        disableShapeHover,
      });
    } else if (draggingPolyline) {
      const { shapeId, index } = draggingPolyline;
      const shape = shapeList.find((s) => s.id === shapeId);
      if (shape && (shape.type === 'polyline' || shape.type === 'connector')) {
        handlePolylinePointDragMove({
          shapes: shapeList,
          shape,
          index,
          x,
          y,
          dragStart: dragStartValue,
          setDragStart,
          setShapesState,
          parsePoints,
          updateConnectorPoints,
          updatePolylinePoints,
          enableConnectorNodeSnap,
          connectorNodeSnapDistance,
          connectorNodeAlignDistance,
          viewBoxMinX: viewBoxMinXValue,
          viewBoxMinY: viewBoxMinYValue,
        });
      }
    } else if (isConnectingValue && tempLineEl && connectionStartId) {
      const fromShapeObj = shapeList.find((s) => s.id === connectionStartId);
      if (fromShapeObj) {
        tempLineEl.setAttribute('x2', String(x));
        tempLineEl.setAttribute('y2', String(y));
      }
    } else if (isDraggingValue && selected.size > 0) {
      const dx = x - dragStartValue.x;
      const dy = y - dragStartValue.y;

      if (dx !== 0 || dy !== 0) {
        selected.forEach((id) => {
          const shape = shapeList.find((s) => s.id === id);
          if (shape) {
            if (shape.type === 'connector' && isLineConnected(shape)) {
              const points = getConnectorPoints(shape);
              if (points.length > 2) {
                const moved = points.map((pt, idx) => {
                  if (idx === 0 || idx === points.length - 1) return pt;
                  return [pt[0] + dx, pt[1] + dy] as [number, number];
                });
                updateConnectorPoints(shape, moved);
              }
              return;
            }
            if (shape.type === 'line' && isLineConnected(shape)) {
              return;
            }
            updateShapePosition(shape, dx, dy);
            refreshResizeHandles(shape);
            refreshCornerHandles(shape);
          }
        });

        // 创建新的形状数组以触发响应式更新（匹配 React 版本的行为）
        const nextShapes = shapeList.map((s) =>
          selected.has(s.id)
            ? { ...s, data: { ...s.data }, connections: s.connections ? [...s.connections] : undefined, element: s.element }
            : s
        );

        selected.forEach((id) => {
          const moved = nextShapes.find((s) => s.id === id);
          if (moved && moved.connections) {
            moved.connections.forEach((connId) => {
              const connLine = nextShapes.find((s) => s.id === connId);
              if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
                updateConnectionLine(connLine, moved.id, nextShapes);
              }
            });
          }
        });

        setShapesState(() => nextShapes);
      }

      setDragStart({ x, y, viewBoxMinX: viewBoxMinXValue, viewBoxMinY: viewBoxMinYValue });
    } else if (isResizingValue) {
      const dx = x - dragStartValue.x;
      const dy = y - dragStartValue.y;
      if (dx !== 0 || dy !== 0) {
        handleResizeMove({
          shapes: shapeList,
          dx,
          dy,
          x,
          y,
          resizeHandle: resizeHandleValue,
          selectedShape: selectedShapeValue,
          draggingCornerHandle: draggingCornerValue,
          cornerHandlesRef,
          setShapesState,
          setDraggingCornerHandle,
          setDragStart,
          updateShapeSize,
          refreshResizeHandles,
          refreshCornerHandles,
          updateConnectionLine,
          viewBoxMinX: viewBoxMinXValue,
          viewBoxMinY: viewBoxMinYValue,
        });
      }
    } else if (isSelectingBoxValue && getRefValue(selectionOriginRef)) {
      const origin = getRefValue(selectionOriginRef);
      if (!origin) return;
      const rect = {
        x: Math.min(origin.x, x),
        y: Math.min(origin.y, y),
        w: Math.abs(x - origin.x),
        h: Math.abs(y - origin.y),
      };
      setSelectionRect(rect);
    }
  };
};
