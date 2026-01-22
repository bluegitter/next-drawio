import { onBeforeUnmount, onMounted, type Ref } from 'vue';
import type { SVGShape } from '../types';
import { finalizeHandleConnection } from './pointerUpFinalize';

type UsePointerUpArgs = {
  svgRef: Ref<SVGSVGElement | null>;
  shapes: Ref<SVGShape[]>;
  selectedIds: Ref<Set<string>>;
  selectedShape: Ref<string | null>;
  draggingHandle: Ref<{ connectorId: string; end: 'start' | 'end'; original: any } | null>;
  draggingPolylinePoint: Ref<{ shapeId: string; index: number } | null>;
  isConnecting: Ref<boolean>;
  connectionStart: Ref<string | null>;
  connectionStartPort: Ref<string | null>;
  isDragging: Ref<boolean>;
  isResizing: Ref<boolean>;
  isSelectingBox: Ref<boolean>;
  selectionRect: Ref<{ x: number; y: number; w: number; h: number } | null>;
  selectionOriginRef: { value: { x: number; y: number } | null };
  tempLine: Ref<SVGElement | null>;
  activePortHighlight: Ref<{ shapeId: string; portId: string } | null>;
  hoveredShapeId: Ref<string | null>;
  handleConnectionRef: { value: boolean };
  skipNextCanvasClickClear: { value: boolean };
  portElementsRef: { value: Map<string, SVGCircleElement[]> };
  lastPointerRef: { value: { x: number; y: number; clientX: number; clientY: number } };
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
      draggingHandle: draggingHandle.value,
      point,
      targetEl,
      shapes: shapes.value,
      selectedIds: selectedIds.value,
      activePortHighlight: activePortHighlight.value,
      hoveredShapeId: hoveredShapeId.value,
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
    if (draggingHandle.value) {
      finalizeHandleConnectionCallback(e.target as SVGElement, {
        x: lastPointerRef.value.x,
        y: lastPointerRef.value.y,
      });
      return;
    }
    if (draggingPolylinePoint.value) {
      saveToHistory();
      setDraggingPolylinePoint(null);
      return;
    }

    if (isConnecting.value && connectionStart.value) {
      const target = e.target as SVGElement;
      const targetPortId = target?.getAttribute('data-port-id') || null;
      const targetPortShapeId = target?.getAttribute('data-shape-id') || null;

      if (targetPortId && targetPortShapeId && targetPortShapeId !== connectionStart.value) {
        connectShapes(connectionStart.value, targetPortShapeId, connectionStartPort.value || undefined, targetPortId);
      } else {
        const targetShape = shapes.value.find((s) => s.element === target || s.element.contains(target));
        if (targetShape && targetShape.id !== connectionStart.value) {
          connectShapes(connectionStart.value, targetShape.id, connectionStartPort.value || undefined, undefined);
        } else {
          if (tempLine.value && svgRef.value) {
            svgRef.value.removeChild(tempLine.value);
            setTempLine(null);
          }
          setIsConnecting(false);
          setConnectionStart(null);
          setConnectionStartPort(null);
        }
      }
    } else if (isDragging.value || isResizing.value) {
      saveToHistory();
    } else if (isSelectingBox.value && selectionRect.value) {
      const selectedList = shapes.value.filter((shape) => {
        if (shape.type === 'connector') return false;
        const b = getShapeBounds(shape);
        return (
          b.minX >= selectionRect.value!.x &&
          b.maxX <= selectionRect.value!.x + selectionRect.value!.w &&
          b.minY >= selectionRect.value!.y &&
          b.maxY <= selectionRect.value!.y + selectionRect.value!.h
        );
      });
      if (selectedList.length) {
        const ids = selectedList.map((s) => s.id);
        setSelectedShapes(ids);
        onShapeSelect?.(selectedList[0].element);
        skipNextCanvasClickClear.value = true;
      }
    }

    setIsSelectingBox(false);
    setSelectionRect(null);
    selectionOriginRef.value = null;

    const target = e.target as SVGElement;
    const targetShape = shapes.value.find((s) => s.element === target || s.element.contains(target));
    if (targetShape && (targetShape.type === 'line' || targetShape.type === 'connector')) {
      setSelectedShape(targetShape.id);
      onShapeSelect?.(targetShape.element);
    }
    if (!targetShape && selectedShape.value) {
      const currentSelected = shapes.value.find((s) => s.id === selectedShape.value);
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
    if (!draggingHandle.value) return;
    const targetEl = document.elementFromPoint(
      lastPointerRef.value.clientX,
      lastPointerRef.value.clientY
    ) as SVGElement | null;
    finalizeHandleConnectionCallback(targetEl, {
      x: lastPointerRef.value.x,
      y: lastPointerRef.value.y,
    });
  };

  onMounted(() => {
    window.addEventListener('mouseup', onWindowMouseUp);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('mouseup', onWindowMouseUp);
  });

  return {
    handleMouseUp,
  };
};
