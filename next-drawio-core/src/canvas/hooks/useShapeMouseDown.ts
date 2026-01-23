import type { SVGShape } from '../types';
import type { MaybeRef } from '../../utils/refs';
import { getRefValue } from '../../utils/refs';

export type UseShapeMouseDownArgs = {
  shapes: MaybeRef<SVGShape[]>;
  selectedIds: MaybeRef<Set<string>>;
  isConnecting: MaybeRef<boolean>;
  connectionStart: MaybeRef<string | null>;
  connectionStartPort: MaybeRef<string | null>;
  disableShapeSelection?: boolean;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  isLineConnected: (shape: SVGShape) => boolean;
  startConnection: (fromShape: string, fromPortId?: string) => void;
  connectShapes: (fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => void;
  setSelectedIds: (next: Set<string>) => void;
  setIsDragging: (next: boolean) => void;
  setDragStart: (next: { x: number; y: number; viewBoxMinX?: number; viewBoxMinY?: number }) => void;
  onShapeSelect?: (shape: SVGElement | null) => void;
  viewBoxMinX?: MaybeRef<number>;
  viewBoxMinY?: MaybeRef<number>;
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
    const shapeList = getRefValue(shapes) ?? [];
    const selected = getRefValue(selectedIds) ?? new Set<string>();
    const selectedShapes = shapeList.filter((s) => selected.has(s.id));
    const selectedGroupId = selectedShapes.length > 0 ? selectedShapes[0].data.groupId : null;
    const isGroupSelection =
      selectedShapes.length > 1 && selectedGroupId && selectedShapes.every((s) => s.data.groupId === selectedGroupId);

    if (e.button === 2) {
      if (selected.size === 0) {
        setSelectedIds(new Set([shape.id]));
        onShapeSelect?.(shape.element);
      }
      return;
    }

    if (getRefValue(isConnecting)) {
      const connectionStartValue = getRefValue(connectionStart);
      if (!connectionStartValue) {
        startConnection(shape.id);
      } else if (connectionStartValue !== shape.id) {
        connectShapes(connectionStartValue, shape.id, getRefValue(connectionStartPort) || undefined, undefined);
      }
      return;
    }

    if (e.metaKey || e.ctrlKey) {
      const next = new Set(selected);
      if (next.has(shape.id)) {
        next.delete(shape.id);
      } else {
        next.add(shape.id);
      }
      setSelectedIds(next);
      if (next.size > 0) {
        const firstSelectedId = Array.from(next)[0];
        const firstSelectedShape = shapeList.find((s) => s.id === firstSelectedId);
        if (firstSelectedShape) {
          onShapeSelect?.(firstSelectedShape.element);
        }
      } else {
        onShapeSelect?.(null);
      }
      return;
    }

    const groupId = shape.data.groupId;
    const alreadyMultiSelected = selected.size > 1 && selected.has(shape.id);
    const viewBoxMinXValue = getRefValue(viewBoxMinX);
    const viewBoxMinYValue = getRefValue(viewBoxMinY);

    if (alreadyMultiSelected) {
      if (isGroupSelection && groupId && groupId === selectedGroupId) {
        setSelectedIds(new Set([shape.id]));
        onShapeSelect?.(shape.element);
        setIsDragging(true);
        setDragStart({ x, y, viewBoxMinX: viewBoxMinXValue ?? undefined, viewBoxMinY: viewBoxMinYValue ?? undefined });
        return;
      }
      onShapeSelect?.(shape.element);
      setIsDragging(true);
      setDragStart({ x, y, viewBoxMinX: viewBoxMinXValue ?? undefined, viewBoxMinY: viewBoxMinYValue ?? undefined });
      return;
    }

    if (groupId) {
      const groupIds = shapeList.filter((s) => s.data.groupId === groupId).map((s) => s.id);
      setSelectedIds(new Set(groupIds));
      onShapeSelect?.(shape.element);
    } else {
      setSelectedIds(new Set([shape.id]));
      onShapeSelect?.(shape.element);
    }
    if ((shape.type === 'line' || shape.type === 'connector') && !isLineConnected(shape)) {
      setIsDragging(true);
      setDragStart({ x, y, viewBoxMinX: viewBoxMinXValue ?? undefined, viewBoxMinY: viewBoxMinYValue ?? undefined });
    } else if (shape.type !== 'line' && shape.type !== 'connector') {
      setIsDragging(true);
      setDragStart({ x, y, viewBoxMinX: viewBoxMinXValue ?? undefined, viewBoxMinY: viewBoxMinYValue ?? undefined });
    } else {
      setIsDragging(false);
    }
  };
};
