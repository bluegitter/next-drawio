import type { Ref } from 'vue';
import type { SVGShape } from '../types';
import { handleConnectorHandleDragMove } from './pointerMoveHandleDrag';
import { handleResizeMove } from './pointerMoveResize';
import { handlePolylinePointDragMove } from './pointerMovePolylinePoint';

export type UsePointerMoveArgs = {
  svgRef: Ref<SVGSVGElement | null>;
  shapes: Ref<SVGShape[]>;
  selectedIds: Ref<Set<string>>;
  draggingHandle: Ref<{ connectorId: string; end: 'start' | 'end'; original: any } | null>;
  draggingPolylinePoint: Ref<{ shapeId: string; index: number } | null>;
  isConnecting: Ref<boolean>;
  tempLine: Ref<SVGElement | null>;
  connectionStart: Ref<string | null>;
  isDragging: Ref<boolean>;
  isResizing: Ref<boolean>;
  isSelectingBox: Ref<boolean>;
  selectionOriginRef: { value: { x: number; y: number } | null };
  hoveredShapeId: Ref<string | null>;
  activePortHighlight: Ref<{ shapeId: string; portId: string } | null>;
  resizeHandle: Ref<string | null>;
  selectedShape: Ref<string | null>;
  draggingCornerHandle: Ref<{ shapeId: string; handleType: string; startCornerRadius: number } | null>;
  dragStart: Ref<{ x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }>;
  cornerHandlesRef: { value: Map<string, SVGRectElement[]> };
  connectorHandleRef: { value: Map<string, { start: SVGCircleElement; end: SVGCircleElement }> };
  portElementsRef: { value: Map<string, SVGCircleElement[]> };
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
  lastPointerRef: { value: { x: number; y: number; clientX: number; clientY: number } };
  enableConnectorNodeSnap?: boolean;
  connectorNodeSnapDistance?: number;
  connectorNodeAlignDistance?: number;
  disableShapeHover?: boolean;
  viewBoxMinX: Ref<number>;
  viewBoxMinY: Ref<number>;
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
    if (!svgRef.value) return;

    const { x, y } = getPointerPosition(e.clientX, e.clientY);
    lastPointerRef.value = { x, y, clientX: e.clientX, clientY: e.clientY };

    if (disableShapeHover) {
      if (hoveredShapeId.value) {
        hidePorts(hoveredShapeId.value);
        setHoveredShapeId(null);
      }
      if (activePortHighlight.value) {
        const prev = portElementsRef.value
          .get(activePortHighlight.value.shapeId)
          ?.find((p) => p.getAttribute('data-port-id') === activePortHighlight.value?.portId);
        if (prev) resetPortStyle(prev as SVGCircleElement);
        setActivePortHighlight(null);
      }
    }

    if (draggingHandle.value) {
      handleConnectorHandleDragMove({
        draggingHandle: draggingHandle.value,
        shapes: shapes.value,
        x,
        y,
        target: e.target,
        hoveredShapeId: hoveredShapeId.value,
        activePortHighlight: activePortHighlight.value,
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
    } else if (draggingPolylinePoint.value) {
      const { shapeId, index } = draggingPolylinePoint.value;
      const shape = shapes.value.find((s) => s.id === shapeId);
      if (shape && (shape.type === 'polyline' || shape.type === 'connector')) {
        handlePolylinePointDragMove({
          shapes: shapes.value,
          shape,
          index,
          x,
          y,
          dragStart: dragStart.value,
          setDragStart,
          setShapesState,
          parsePoints,
          updateConnectorPoints,
          updatePolylinePoints,
          enableConnectorNodeSnap,
          connectorNodeSnapDistance,
          connectorNodeAlignDistance,
          viewBoxMinX: viewBoxMinX.value,
          viewBoxMinY: viewBoxMinY.value,
        });
      }
    } else if (isConnecting.value && tempLine.value && connectionStart.value) {
      const fromShapeObj = shapes.value.find((s) => s.id === connectionStart.value);
      if (fromShapeObj) {
        tempLine.value.setAttribute('x2', String(x));
        tempLine.value.setAttribute('y2', String(y));
      }
    } else if (isDragging.value && selectedIds.value.size > 0) {
      const dx = x - dragStart.value.x;
      const dy = y - dragStart.value.y;

      if (dx !== 0 || dy !== 0) {
        selectedIds.value.forEach((id) => {
          const shape = shapes.value.find((s) => s.id === id);
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
        const nextShapes = shapes.value.map((s) =>
          selectedIds.value.has(s.id)
            ? { ...s, data: { ...s.data }, connections: s.connections ? [...s.connections] : undefined, element: s.element }
            : s
        );

        selectedIds.value.forEach((id) => {
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

      setDragStart({ x, y, viewBoxMinX: viewBoxMinX.value, viewBoxMinY: viewBoxMinY.value });
    } else if (isResizing.value) {
      const dx = x - dragStart.value.x;
      const dy = y - dragStart.value.y;
      if (dx !== 0 || dy !== 0) {
        handleResizeMove({
          shapes: shapes.value,
          dx,
          dy,
          x,
          y,
          resizeHandle: resizeHandle.value,
          selectedShape: selectedShape.value,
          draggingCornerHandle: draggingCornerHandle.value,
          cornerHandlesRef,
          setShapesState,
          setDraggingCornerHandle,
          setDragStart,
          updateShapeSize,
          refreshResizeHandles,
          refreshCornerHandles,
          updateConnectionLine,
          viewBoxMinX: viewBoxMinX.value,
          viewBoxMinY: viewBoxMinY.value,
        });
      }
    } else if (isSelectingBox.value && selectionOriginRef.value) {
      const origin = selectionOriginRef.value;
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
