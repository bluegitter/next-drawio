import type { SVGShape } from '../types';
import { finalizeHandleConnection } from './pointerUpFinalize';
import type { MaybeRef, RefLike } from '../../utils/refs';
import { getRefValue, setRefValue } from '../../utils/refs';

export type UsePointerUpArgs = {
  svgRef: RefLike<SVGSVGElement>;
  shapes: MaybeRef<SVGShape[]>;
  selectedIds: MaybeRef<Set<string>>;
  selectedShape: MaybeRef<string | null>;
  draggingHandle: MaybeRef<{ connectorId: string; end: 'start' | 'end'; original: any } | null>;
  draggingPolylinePoint: MaybeRef<{ shapeId: string; index: number } | null>;
  isConnecting: MaybeRef<boolean>;
  connectionStart: MaybeRef<string | null>;
  connectionStartPort: MaybeRef<string | null>;
  isDragging: MaybeRef<boolean>;
  isResizing: MaybeRef<boolean>;
  isSelectingBox: MaybeRef<boolean>;
  selectionRect: MaybeRef<{ x: number; y: number; w: number; h: number } | null>;
  selectionOriginRef: RefLike<{ x: number; y: number }>;
  tempLine: MaybeRef<SVGElement | null>;
  activePortHighlight: MaybeRef<{ shapeId: string; portId: string } | null>;
  hoveredShapeId: MaybeRef<string | null>;
  handleConnectionRef: RefLike<boolean>;
  skipNextCanvasClickClear: RefLike<boolean>;
  portElementsRef: RefLike<Map<string, SVGCircleElement[]>>;
  lastPointerRef: RefLike<{ x: number; y: number; clientX: number; clientY: number }>;
  setDraggingHandle: (next: { connectorId: string; end: 'start' | 'end'; original: any } | null) => void;
  setDraggingPolylinePoint: (next: { shapeId: string; index: number } | null) => void;
  setIsConnecting: (next: boolean) => void;
  setConnectionStart: (next: string | null) => void;
  setConnectionStartPort: (next: string | null) => void;
  setIsDragging: (next: boolean) => void;
  setIsResizing: (next: boolean) => void;
  setResizeHandle: (next: string | null) => void;
  setDraggingCornerHandle: (next: { shapeId: string; handleType: string; startCornerRadius: number } | null) => void;
  setDragStart: (next: { x: number; y: number }) => void;
  setIsSelectingBox: (next: boolean) => void;
  setSelectionRect: (next: { x: number; y: number; w: number; h: number } | null) => void;
  setTempLine: (next: SVGElement | null) => void;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setSelectedShape: (id: string | null) => void;
  setSelectedShapes: (ids: string[] | Set<string>) => void;
  setActivePortHighlight: (next: { shapeId: string; portId: string } | null) => void;
  setHoveredShapeId: (next: string | null) => void;
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
};

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
  const finalizeHandleConnectionCallback = (targetEl: SVGElement | null, point: { x: number; y: number }) => {
    finalizeHandleConnection({
      draggingHandle: getRefValue(draggingHandle),
      point,
      targetEl,
      shapes: getRefValue(shapes) ?? [],
      selectedIds: getRefValue(selectedIds) ?? new Set<string>(),
      activePortHighlight: getRefValue(activePortHighlight),
      hoveredShapeId: getRefValue(hoveredShapeId),
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
  };

  const handleMouseUp = (e: MouseEvent | PointerEvent) => {
    const draggingHandleValue = getRefValue(draggingHandle);
    const draggingPolylineValue = getRefValue(draggingPolylinePoint);
    const isConnectingValue = Boolean(getRefValue(isConnecting));
    const connectionStartId = getRefValue(connectionStart);
    const connectionStartPortId = getRefValue(connectionStartPort);
    const isDraggingValue = Boolean(getRefValue(isDragging));
    const isResizingValue = Boolean(getRefValue(isResizing));
    const isSelectingBoxValue = Boolean(getRefValue(isSelectingBox));
    const selectionRectValue = getRefValue(selectionRect);
    const shapeList = getRefValue(shapes) ?? [];

    if (draggingHandleValue) {
      const point = getRefValue(lastPointerRef) ?? { x: 0, y: 0, clientX: 0, clientY: 0 };
      finalizeHandleConnectionCallback(e.target as SVGElement, { x: point.x, y: point.y });
      return;
    }

    if (draggingPolylineValue) {
      saveToHistory();
      setDraggingPolylinePoint(null);
      return;
    }

    if (isConnectingValue && connectionStartId) {
      const target = e.target as SVGElement;
      const targetPortId = target?.getAttribute('data-port-id') || null;
      const targetPortShapeId = target?.getAttribute('data-shape-id') || null;

      if (targetPortId && targetPortShapeId && targetPortShapeId !== connectionStartId) {
        connectShapes(connectionStartId, targetPortShapeId, connectionStartPortId || undefined, targetPortId);
      } else {
        const targetShape = shapeList.find((s) => s.element === target || s.element.contains(target));
        if (targetShape && targetShape.id !== connectionStartId) {
          connectShapes(connectionStartId, targetShape.id, connectionStartPortId || undefined, undefined);
        } else {
          const tempLineEl = getRefValue(tempLine);
          const svg = getRefValue(svgRef);
          if (tempLineEl && svg && svg.contains(tempLineEl)) {
            svg.removeChild(tempLineEl);
            setTempLine(null);
          }
          setIsConnecting(false);
          setConnectionStart(null);
          setConnectionStartPort(null);
        }
      }
    } else if (isDraggingValue || isResizingValue) {
      saveToHistory();
    } else if (isSelectingBoxValue && selectionRectValue) {
      const selectedList = shapeList.filter((shape) => {
        if (shape.type === 'connector') return false;
        const b = getShapeBounds(shape);
        return (
          b.minX >= selectionRectValue.x &&
          b.maxX <= selectionRectValue.x + selectionRectValue.w &&
          b.minY >= selectionRectValue.y &&
          b.maxY <= selectionRectValue.y + selectionRectValue.h
        );
      });
      if (selectedList.length) {
        const ids = selectedList.map((s) => s.id);
        setSelectedShapes(ids);
        onShapeSelect?.(selectedList[0].element);
        setRefValue(skipNextCanvasClickClear, true);
      }
    }

    setIsSelectingBox(false);
    setSelectionRect(null);
    setRefValue(selectionOriginRef, null);

    const target = e.target as SVGElement;
    const targetShape = shapeList.find((s) => s.element === target || s.element.contains(target));
    if (targetShape && (targetShape.type === 'line' || targetShape.type === 'connector')) {
      setSelectedShape(targetShape.id);
      onShapeSelect?.(targetShape.element);
    }
    const selectedShapeId = getRefValue(selectedShape);
    if (!targetShape && selectedShapeId) {
      const currentSelected = shapeList.find((s) => s.id === selectedShapeId);
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
  };

  const onWindowMouseUp = () => {
    const draggingHandleValue = getRefValue(draggingHandle);
    if (!draggingHandleValue) return;
    const lastPointer = getRefValue(lastPointerRef) ?? { x: 0, y: 0, clientX: 0, clientY: 0 };
    const targetEl = document.elementFromPoint(lastPointer.clientX, lastPointer.clientY) as SVGElement | null;
    finalizeHandleConnectionCallback(targetEl, { x: lastPointer.x, y: lastPointer.y });
  };

  return {
    handleMouseUp,
    onWindowMouseUp,
  };
};
