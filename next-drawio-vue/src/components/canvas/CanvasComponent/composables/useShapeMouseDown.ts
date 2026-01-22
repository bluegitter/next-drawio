import type { Ref } from 'vue';
import type { SVGShape } from '../types';

type UseShapeMouseDownArgs = {
  shapes: Ref<SVGShape[]>;
  selectedIds: Ref<Set<string>>;
  isConnecting: Ref<boolean>;
  connectionStart: Ref<string | null>;
  connectionStartPort: Ref<string | null>;
  disableShapeSelection?: boolean;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  isLineConnected: (shape: SVGShape) => boolean;
  startConnection: (fromShape: string, fromPortId?: string) => void;
  connectShapes: (fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => void;
  setSelectedIds: (next: Set<string>) => void;
  setIsDragging: (next: boolean) => void;
  setDragStart: (next: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
  viewBoxMinX: Ref<number>;
  viewBoxMinY: Ref<number>;
};

export const useShapeMouseDown = ({
  shapes,
  selectedIds,
  isConnecting,
  connectionStart,
  connectionStartPort,
  disableShapeSelection = false,
  getPointerPosition,
  isLineConnected,
  startConnection,
  connectShapes,
  setSelectedIds,
  setIsDragging,
  setDragStart,
  onShapeSelect,
  viewBoxMinX,
  viewBoxMinY,
}: UseShapeMouseDownArgs) => {
  return (e: MouseEvent, shape: SVGShape) => {
    if (disableShapeSelection) return;
    e.stopPropagation();

    const { x, y } = getPointerPosition(e.clientX, e.clientY);
    const selectedShapes = shapes.value.filter((s) => selectedIds.value.has(s.id));
    const selectedGroupId = selectedShapes.length > 0 ? selectedShapes[0].data.groupId : null;
    const isGroupSelection =
      selectedShapes.length > 1 && selectedGroupId && selectedShapes.every((s) => s.data.groupId === selectedGroupId);

    if ((e as MouseEvent).button === 2) {
      if (selectedIds.value.size === 0) {
        setSelectedIds(new Set([shape.id]));
        onShapeSelect?.(shape.element);
      }
      return;
    }

    if (isConnecting.value) {
      if (!connectionStart.value) {
        startConnection(shape.id);
      } else if (connectionStart.value !== shape.id) {
        connectShapes(connectionStart.value, shape.id, connectionStartPort.value || undefined, undefined);
      }
      return;
    }

    if ((e as MouseEvent).metaKey || (e as MouseEvent).ctrlKey) {
      const next = new Set(selectedIds.value);
      if (next.has(shape.id)) {
        next.delete(shape.id);
      } else {
        next.add(shape.id);
      }
      setSelectedIds(next);
      if (next.size > 0) {
        const firstSelectedId = Array.from(next)[0];
        const firstSelectedShape = shapes.value.find((s) => s.id === firstSelectedId);
        if (firstSelectedShape) {
          onShapeSelect?.(firstSelectedShape.element);
        }
      } else {
        onShapeSelect?.(null);
      }
      return;
    }

    const groupId = shape.data.groupId;
    const alreadyMultiSelected = selectedIds.value.size > 1 && selectedIds.value.has(shape.id);

    if (alreadyMultiSelected) {
      if (isGroupSelection && groupId && groupId === selectedGroupId) {
        setSelectedIds(new Set([shape.id]));
        onShapeSelect?.(shape.element);
        setIsDragging(true);
        setDragStart({ x, y, viewBoxMinX: viewBoxMinX.value, viewBoxMinY: viewBoxMinY.value });
        return;
      }
      onShapeSelect?.(shape.element);
      setIsDragging(true);
      setDragStart({ x, y, viewBoxMinX: viewBoxMinX.value, viewBoxMinY: viewBoxMinY.value });
      return;
    }

    if (groupId) {
      const groupIds = shapes.value.filter((s) => s.data.groupId === groupId).map((s) => s.id);
      setSelectedIds(new Set(groupIds));
      onShapeSelect?.(shape.element);
    } else {
      setSelectedIds(new Set([shape.id]));
      onShapeSelect?.(shape.element);
    }
    if ((shape.type === 'line' || shape.type === 'connector') && !isLineConnected(shape)) {
      setIsDragging(true);
      setDragStart({ x, y, viewBoxMinX: viewBoxMinX.value, viewBoxMinY: viewBoxMinY.value });
    } else if (shape.type !== 'line' && shape.type !== 'connector') {
      setIsDragging(true);
      setDragStart({ x, y, viewBoxMinX: viewBoxMinX.value, viewBoxMinY: viewBoxMinY.value });
    } else {
      setIsDragging(false);
    }
  };
};
