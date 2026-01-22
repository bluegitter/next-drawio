import { useCallback } from 'react';
import type React from 'react';
import type { SVGShape } from '../types';
import { handleConnectorHandleDragMove } from './pointerMoveHandleDrag';
import { handleResizeMove } from './pointerMoveResize';
import { handlePolylinePointDragMove } from './pointerMovePolylinePoint';

interface UsePointerMoveArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  selectedIds: Set<string>;
  draggingHandle: { connectorId: string; end: 'start' | 'end'; original: any } | null;
  draggingPolylinePoint: { shapeId: string; index: number } | null;
  isConnecting: boolean;
  tempLine: SVGElement | null;
  connectionStart: string | null;
  isDragging: boolean;
  isResizing: boolean;
  isSelectingBox: boolean;
  selectionOriginRef: React.MutableRefObject<{ x: number; y: number } | null>;
  hoveredShapeId: string | null;
  activePortHighlight: { shapeId: string; portId: string } | null;
  resizeHandle: string | null;
  selectedShape: string | null;
  draggingCornerHandle: { shapeId: string; handleType: string; startCornerRadius: number } | null;
  dragStart: { x: number; y: number };
  cornerHandlesRef: React.MutableRefObject<Map<string, SVGRectElement[]>>;
  connectorHandleRef: React.MutableRefObject<Map<string, { start: SVGCircleElement; end: SVGCircleElement }>>;
  portElementsRef: React.MutableRefObject<Map<string, SVGCircleElement[]>>;
  setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectionRect: React.Dispatch<React.SetStateAction<{ x: number; y: number; w: number; h: number } | null>>;
  setHoveredShapeId: React.Dispatch<React.SetStateAction<string | null>>;
  setActivePortHighlight: React.Dispatch<React.SetStateAction<{ shapeId: string; portId: string } | null>>;
  setDraggingCornerHandle: React.Dispatch<React.SetStateAction<{ shapeId: string; handleType: string; startCornerRadius: number } | null>>;
  updateShapePosition: (shape: SVGShape, dx: number, dy: number) => void;
  updateShapeSize: (shape: SVGShape, handle: string, dx: number, dy: number) => void;
  updateConnectionLine: (connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => void;
  updateConnectorPoints: (shape: SVGShape, points: Array<[number, number]>) => void;
  updatePolylinePoints: (shape: SVGShape, points: Array<[number, number]>) => void;
  refreshResizeHandles: (shape: SVGShape) => void;
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
  showCornerHandles: (shape: SVGShape) => void;
  lastPointerRef: React.MutableRefObject<{ x: number; y: number; clientX: number; clientY: number }>;
  enableConnectorNodeSnap?: boolean;
  connectorNodeSnapDistance?: number;
  connectorNodeAlignDistance?: number;
  disableShapeHover?: boolean;
}

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
  showCornerHandles,
  lastPointerRef,
  enableConnectorNodeSnap = true,
  connectorNodeSnapDistance = 14,
  connectorNodeAlignDistance = 6,
  disableShapeHover = false,
}: UsePointerMoveArgs) => {
  return useCallback((e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<HTMLElement>) => {
    if (!svgRef.current) return;

    const { x, y } = getPointerPosition(e.clientX, e.clientY);
    lastPointerRef.current = { x, y, clientX: e.clientX, clientY: e.clientY };

    if (disableShapeHover) {
      if (hoveredShapeId) {
        hidePorts(hoveredShapeId);
        setHoveredShapeId(null);
      }
      if (activePortHighlight) {
        const prev = portElementsRef.current
          .get(activePortHighlight.shapeId)
          ?.find(p => p.getAttribute('data-port-id') === activePortHighlight.portId);
        if (prev) resetPortStyle(prev as SVGCircleElement);
        setActivePortHighlight(null);
      }
    }

    if (draggingHandle) {
      handleConnectorHandleDragMove({
        draggingHandle,
        shapes,
        x,
        y,
        target: e.target,
        hoveredShapeId,
        activePortHighlight,
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
    } else if (draggingPolylinePoint) {
      const { shapeId, index } = draggingPolylinePoint;
      const shape = shapes.find(s => s.id === shapeId);
      if (shape && (shape.type === 'polyline' || shape.type === 'connector')) {
        handlePolylinePointDragMove({
          shapes,
          shape,
          index,
          x,
          y,
          dragStart,
          setDragStart,
          setShapesState,
          parsePoints,
          updateConnectorPoints,
          updatePolylinePoints,
          enableConnectorNodeSnap,
          connectorNodeSnapDistance,
          connectorNodeAlignDistance,
        });
      }
    } else if (isConnecting && tempLine && connectionStart) {
      const fromShapeObj = shapes.find(s => s.id === connectionStart);
      if (fromShapeObj) {
        tempLine.setAttribute('x2', String(x));
        tempLine.setAttribute('y2', String(y));
      }
    } else if (isDragging && selectedIds.size > 0) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      if (dx !== 0 || dy !== 0) {
        selectedIds.forEach(id => {
          const shape = shapes.find(s => s.id === id);
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
          }
        });

        const nextShapes = shapes.map(s => selectedIds.has(s.id)
          ? { ...s, data: { ...s.data }, connections: s.connections ? [...s.connections] : undefined, element: s.element }
          : s);

        selectedIds.forEach(id => {
          const moved = nextShapes.find(s => s.id === id);
          if (moved && moved.connections) {
            moved.connections.forEach(connId => {
              const connLine = nextShapes.find(s => s.id === connId);
              if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
                updateConnectionLine(connLine, moved.id, nextShapes);
              }
            });
          }
        });

        nextShapes.forEach(shape => {
          if (shape.type !== 'connector') return;
          if (selectedIds.has(shape.id)) return;
          const [fromId, toId] = (shape.connections || []) as Array<string | null | undefined>;
          if (!fromId || !toId) return;
          if (!selectedIds.has(fromId) || !selectedIds.has(toId)) return;
          const points = getConnectorPoints(shape);
          if (points.length <= 2) return;
          const movedPoints = points.map((pt, idx) => {
            if (idx === 0 || idx === points.length - 1) return pt;
            return [pt[0] + dx, pt[1] + dy] as [number, number];
          });
          updateConnectorPoints(shape, movedPoints);
        });

        setShapesState(() => nextShapes);
      }

      setDragStart({ x, y });
    } else if (isResizing) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      handleResizeMove({
        shapes,
        dx,
        dy,
        x,
        y,
        resizeHandle,
        selectedShape,
        draggingCornerHandle,
        cornerHandlesRef,
        setShapesState,
        setDraggingCornerHandle,
        setDragStart,
        updateShapeSize,
        refreshResizeHandles,
        showCornerHandles,
        updateConnectionLine,
      });
    } else if (isSelectingBox && selectionOriginRef.current) {
      const start = selectionOriginRef.current;
      const minX = Math.min(start.x, x);
      const minY = Math.min(start.y, y);
      const w = Math.abs(x - start.x);
      const h = Math.abs(y - start.y);
      setSelectionRect({ x: minX, y: minY, w, h });
    } else if (draggingHandle) {
      if (disableShapeHover) return;
      const padding = 12;
      let hovered: SVGShape | null = null;
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (shape.type === 'connector') continue;
        const bounds = getShapeBounds(shape);
        if (
          x >= bounds.minX - padding &&
          x <= bounds.maxX + padding &&
          y >= bounds.minY - padding &&
          y <= bounds.maxY + padding
        ) {
          hovered = shape;
          break;
        }
      }

      if (hovered && hovered.id !== hoveredShapeId) {
        if (hoveredShapeId) hidePorts(hoveredShapeId);
        setHoveredShapeId(hovered.id);
        showPorts(hovered);
      } else if (!hovered && hoveredShapeId) {
        hidePorts(hoveredShapeId);
        setHoveredShapeId(null);
      }
    } else if (!isConnecting && !isDragging && !isResizing && !draggingHandle) {
      if (disableShapeHover) return;
      const padding = 10;
      let hovered: SVGShape | null = null;

      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (shape.type === 'connector') continue;
        const bounds = getShapeBounds(shape);
        if (
          x >= bounds.minX - padding &&
          x <= bounds.maxX + padding &&
          y >= bounds.minY - padding &&
          y <= bounds.maxY + padding
        ) {
          hovered = shape;
          break;
        }
      }

      if (hovered && hovered.id !== hoveredShapeId) {
        if (hoveredShapeId) hidePorts(hoveredShapeId);
        setHoveredShapeId(hovered.id);
        showPorts(hovered);
      } else if (!hovered && hoveredShapeId) {
        hidePorts(hoveredShapeId);
        setHoveredShapeId(null);
      }
    }
  }, [activePortHighlight, connectionStart, connectorNodeAlignDistance, connectorNodeSnapDistance, disableShapeHover, dragStart, draggingCornerHandle, draggingHandle, draggingPolylinePoint, enableConnectorNodeSnap, findNearestPortElement, getConnectorPoints, getPointerPosition, getShapeBounds, hidePorts, highlightPortStyle, hoveredShapeId, isConnecting, isDragging, isLineConnected, isResizing, isSelectingBox, parsePoints, refreshResizeHandles, resetPortStyle, resizeHandle, selectedIds, selectedShape, selectionOriginRef, setActivePortHighlight, setDragStart, setHoveredShapeId, setSelectionRect, setShapesState, setDraggingCornerHandle, shapes, showCornerHandles, showPorts, tempLine, updateConnectionLine, updateConnectorPoints, updatePolylinePoints, updateShapePosition, updateShapeSize, svgRef, portElementsRef, connectorHandleRef, lastPointerRef]);
};
