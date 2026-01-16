import { useCallback, useEffect } from 'react';
import type React from 'react';
import type { SVGShape } from '../types';
import { finalizeHandleConnection } from './pointerUpFinalize';

interface UsePointerUpArgs {
  svgRef: React.RefObject<SVGSVGElement>;
  shapes: SVGShape[];
  selectedIds: Set<string>;
  selectedShape: string | null;
  draggingHandle: { connectorId: string; end: 'start' | 'end'; original: any } | null;
  draggingPolylinePoint: { shapeId: string; index: number } | null;
  isConnecting: boolean;
  connectionStart: string | null;
  connectionStartPort: string | null;
  isDragging: boolean;
  isResizing: boolean;
  isSelectingBox: boolean;
  selectionRect: { x: number; y: number; w: number; h: number } | null;
  selectionOriginRef: React.MutableRefObject<{ x: number; y: number } | null>;
  tempLine: SVGElement | null;
  activePortHighlight: { shapeId: string; portId: string } | null;
  hoveredShapeId: string | null;
  handleConnectionRef: React.MutableRefObject<boolean>;
  skipNextCanvasClickClear: React.MutableRefObject<boolean>;
  portElementsRef: React.MutableRefObject<Map<string, SVGCircleElement[]>>;
  lastPointerRef: React.MutableRefObject<{ x: number; y: number; clientX: number; clientY: number }>;
  setDraggingHandle: React.Dispatch<React.SetStateAction<{ connectorId: string; end: 'start' | 'end'; original: any } | null>>;
  setDraggingPolylinePoint: React.Dispatch<React.SetStateAction<{ shapeId: string; index: number } | null>>;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setConnectionStart: React.Dispatch<React.SetStateAction<string | null>>;
  setConnectionStartPort: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
  setResizeHandle: React.Dispatch<React.SetStateAction<string | null>>;
  setDraggingCornerHandle: React.Dispatch<React.SetStateAction<{ shapeId: string; handleType: string; startCornerRadius: number } | null>>;
  setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setIsSelectingBox: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectionRect: React.Dispatch<React.SetStateAction<{ x: number; y: number; w: number; h: number } | null>>;
  setTempLine: React.Dispatch<React.SetStateAction<SVGElement | null>>;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedShape: (id: string | null) => void;
  setSelectedShapes: (ids: string[] | Set<string>) => void;
  setActivePortHighlight: React.Dispatch<React.SetStateAction<{ shapeId: string; portId: string } | null>>;
  setHoveredShapeId: React.Dispatch<React.SetStateAction<string | null>>;
  connectShapes: (fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => void;
  findNearestPortElement: (x: number, y: number) => SVGCircleElement | null;
  getConnectorPoints: (shape: SVGShape) => Array<[number, number]>;
  getPortPositionById: (shape: SVGShape, portId?: string | null) => { x: number; y: number } | null;
  getShapeBounds: (shape: SVGShape) => { minX: number; minY: number; maxX: number; maxY: number };
  getShapeCenter: (shape: SVGShape) => { x: number; y: number };
  updateConnectorPoints: (shape: SVGShape, points: Array<[number, number]>) => void;
  showConnectorHandles: (shape: SVGShape) => void;
  hidePorts: (shapeId: string) => void;
  resetPortStyle: (el: SVGCircleElement) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
  saveToHistory: (snapshotShapes?: SVGShape[], snapshotSelectedIds?: string[] | Set<string> | string | null) => void;
}

export const usePointerUp = ({
  svgRef,
  shapes,
  selectedIds,
  selectedShape,
  draggingHandle,
  draggingPolylinePoint,
  isConnecting,
  connectionStart,
  connectionStartPort,
  isDragging,
  isResizing,
  isSelectingBox,
  selectionRect,
  selectionOriginRef,
  tempLine,
  activePortHighlight,
  hoveredShapeId,
  handleConnectionRef,
  skipNextCanvasClickClear,
  portElementsRef,
  lastPointerRef,
  setDraggingHandle,
  setDraggingPolylinePoint,
  setIsConnecting,
  setConnectionStart,
  setConnectionStartPort,
  setIsDragging,
  setIsResizing,
  setResizeHandle,
  setDraggingCornerHandle,
  setDragStart,
  setIsSelectingBox,
  setSelectionRect,
  setTempLine,
  setShapesState,
  setSelectedShape,
  setSelectedShapes,
  setActivePortHighlight,
  setHoveredShapeId,
  connectShapes,
  findNearestPortElement,
  getConnectorPoints,
  getPortPositionById,
  getShapeBounds,
  getShapeCenter,
  updateConnectorPoints,
  showConnectorHandles,
  hidePorts,
  resetPortStyle,
  onShapeSelect,
  saveToHistory,
}: UsePointerUpArgs) => {
  const finalizeHandleConnectionCallback = useCallback((targetEl: SVGElement | null, point: { x: number; y: number }) => {
    finalizeHandleConnection({
      draggingHandle,
      point,
      targetEl,
      shapes,
      selectedIds,
      activePortHighlight,
      hoveredShapeId,
      handleConnectionRef,
      portElementsRef,
      setDraggingHandle,
      setIsConnecting,
      setSelectedShape,
      setActivePortHighlight,
      setHoveredShapeId,
      setShapesState,
      findNearestPortElement,
      getConnectorPoints,
      getPortPositionById,
      getShapeCenter,
      updateConnectorPoints,
      showConnectorHandles,
      hidePorts,
      resetPortStyle,
      onShapeSelect,
      saveToHistory,
    });
  }, [activePortHighlight, draggingHandle, findNearestPortElement, getConnectorPoints, getPortPositionById, getShapeCenter, handleConnectionRef, hidePorts, hoveredShapeId, onShapeSelect, resetPortStyle, saveToHistory, selectedIds, setActivePortHighlight, setDraggingHandle, setHoveredShapeId, setIsConnecting, setSelectedShape, setShapesState, shapes, showConnectorHandles, updateConnectorPoints]);

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<HTMLElement>) => {
    if (draggingHandle) {
      finalizeHandleConnectionCallback(e.target as SVGElement, { x: lastPointerRef.current.x, y: lastPointerRef.current.y });
      return;
    }
    if (draggingPolylinePoint) {
      saveToHistory();
      setDraggingPolylinePoint(null);
      return;
    }

    if (isConnecting && connectionStart) {
      const target = e.target as SVGElement;
      const targetPortId = target?.getAttribute('data-port-id') || null;
      const targetPortShapeId = target?.getAttribute('data-shape-id') || null;

      if (targetPortId && targetPortShapeId && targetPortShapeId !== connectionStart) {
        connectShapes(connectionStart, targetPortShapeId, connectionStartPort || undefined, targetPortId);
      } else {
        const targetShape = shapes.find(s => s.element === target || s.element.contains(target));
        if (targetShape && targetShape.id !== connectionStart) {
          connectShapes(connectionStart, targetShape.id, connectionStartPort || undefined, undefined);
        } else {
          if (tempLine && svgRef.current) {
            svgRef.current.removeChild(tempLine);
            setTempLine(null);
          }
          setIsConnecting(false);
          setConnectionStart(null);
          setConnectionStartPort(null);
        }
      }
    } else if (isDragging || isResizing) {
      saveToHistory();
    } else if (isSelectingBox && selectionRect) {
      const selectedList = shapes.filter(shape => {
        if (shape.type === 'connector') return false;
        const b = getShapeBounds(shape);
        return b.minX >= selectionRect.x &&
          b.maxX <= selectionRect.x + selectionRect.w &&
          b.minY >= selectionRect.y &&
          b.maxY <= selectionRect.y + selectionRect.h;
      });
      if (selectedList.length) {
        const ids = selectedList.map(s => s.id);
        setSelectedShapes(ids);
        onShapeSelect?.(selectedList[0].element);
        skipNextCanvasClickClear.current = true;
      }
    }

    setIsSelectingBox(false);
    setSelectionRect(null);
    selectionOriginRef.current = null;

    const target = e.target as SVGElement;
    const targetShape = shapes.find(s => s.element === target || s.element.contains(target));
    if (targetShape && (targetShape.type === 'line' || targetShape.type === 'connector')) {
      setSelectedShape(targetShape.id);
      onShapeSelect?.(targetShape.element);
    }
    if (!targetShape && selectedShape) {
      const currentSelected = shapes.find(s => s.id === selectedShape);
      if (currentSelected && (currentSelected.type === 'line' || currentSelected.type === 'connector')) {
        setSelectedShape(currentSelected.id);
        onShapeSelect?.(currentSelected.element);
      }
    }

    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setDraggingCornerHandle(null);
    setDragStart({ x: 0, y: 0 });
    setSelectionRect(null);
  }, [connectShapes, connectionStart, connectionStartPort, draggingHandle, draggingPolylinePoint, finalizeHandleConnectionCallback, getShapeBounds, isConnecting, isDragging, isResizing, isSelectingBox, lastPointerRef, onShapeSelect, saveToHistory, selectedShape, selectionRect, selectionOriginRef, setConnectionStart, setConnectionStartPort, setDraggingCornerHandle, setDraggingPolylinePoint, setDragStart, setIsConnecting, setIsDragging, setIsResizing, setIsSelectingBox, setResizeHandle, setSelectedShape, setSelectedShapes, setSelectionRect, setTempLine, shapes, skipNextCanvasClickClear, svgRef, tempLine]);

  useEffect(() => {
    const onWindowMouseUp = () => {
      if (!draggingHandle) return;
      const targetEl = document.elementFromPoint(lastPointerRef.current.clientX, lastPointerRef.current.clientY) as SVGElement | null;
      finalizeHandleConnectionCallback(targetEl, { x: lastPointerRef.current.x, y: lastPointerRef.current.y });
    };
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => window.removeEventListener('mouseup', onWindowMouseUp);
  }, [draggingHandle, finalizeHandleConnectionCallback, lastPointerRef]);

  return {
    handleMouseUp,
  };
};
