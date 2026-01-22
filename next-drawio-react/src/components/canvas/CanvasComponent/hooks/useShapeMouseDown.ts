import { useCallback } from 'react';
import type React from 'react';
import type { SVGShape } from '../types';

interface UseShapeMouseDownArgs {
  shapes: SVGShape[];
  selectedIds: Set<string>;
  isConnecting: boolean;
  connectionStart: string | null;
  connectionStartPort: string | null;
  disableShapeSelection?: boolean;
  getPointerPosition: (clientX: number, clientY: number) => { x: number; y: number };
  isLineConnected: (shape: SVGShape) => boolean;
  startConnection: (fromShape: string, fromPortId?: string) => void;
  connectShapes: (fromShape: string, toShape: string, fromPortId?: string, toPortId?: string) => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  onShapeSelect?: (shape: SVGElement | null) => void;
}

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
}: UseShapeMouseDownArgs) => {
  return useCallback((e: React.MouseEvent, shape: SVGShape) => {
    if (disableShapeSelection) return;
    e.stopPropagation();

    const { x, y } = getPointerPosition(e.clientX, e.clientY);
    const selectedShapes = shapes.filter(s => selectedIds.has(s.id));
    const selectedGroupId = selectedShapes.length > 0 ? selectedShapes[0].data.groupId : null;
    const isGroupSelection = selectedShapes.length > 1 && selectedGroupId && selectedShapes.every(s => s.data.groupId === selectedGroupId);

    if (e.button === 2) {
      if (selectedIds.size === 0) {
        setSelectedIds(new Set([shape.id]));
        onShapeSelect?.(shape.element);
      }
      return;
    }

    if (isConnecting) {
      if (!connectionStart) {
        startConnection(shape.id);
      } else if (connectionStart !== shape.id) {
        connectShapes(connectionStart, shape.id, connectionStartPort || undefined, undefined);
      }
      return;
    }

    if (e.metaKey || e.ctrlKey) {
      const next = new Set(selectedIds);
      if (next.has(shape.id)) {
        next.delete(shape.id);
      } else {
        next.add(shape.id);
      }
      setSelectedIds(next);
      if (next.size > 0) {
        const firstSelectedId = Array.from(next)[0];
        const firstSelectedShape = shapes.find(s => s.id === firstSelectedId);
        if (firstSelectedShape) {
          onShapeSelect?.(firstSelectedShape.element);
        }
      } else {
        onShapeSelect?.(null);
      }
      return;
    }

    const groupId = shape.data.groupId;
    const alreadyMultiSelected = selectedIds.size > 1 && selectedIds.has(shape.id);

    if (alreadyMultiSelected) {
      if (isGroupSelection && groupId && groupId === selectedGroupId) {
        setSelectedIds(new Set([shape.id]));
        onShapeSelect?.(shape.element);
        setIsDragging(true);
        setDragStart({ x, y });
        return;
      }
      onShapeSelect?.(shape.element);
      setIsDragging(true);
      setDragStart({ x, y });
      return;
    }

    if (groupId) {
      const groupIds = shapes.filter(s => s.data.groupId === groupId).map(s => s.id);
      setSelectedIds(new Set(groupIds));
      onShapeSelect?.(shape.element);
    } else {
      setSelectedIds(new Set([shape.id]));
      onShapeSelect?.(shape.element);
    }
    if ((shape.type === 'line' || shape.type === 'connector') && !isLineConnected(shape)) {
      setIsDragging(true);
      setDragStart({ x, y });
    } else if (shape.type !== 'line' && shape.type !== 'connector') {
      setIsDragging(true);
      setDragStart({ x, y });
    } else {
      setIsDragging(false);
    }
  }, [connectShapes, connectionStart, connectionStartPort, disableShapeSelection, getPointerPosition, isConnecting, isLineConnected, onShapeSelect, selectedIds, setDragStart, setIsDragging, setSelectedIds, shapes, startConnection]);
};
