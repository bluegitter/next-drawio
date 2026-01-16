import type React from 'react';
import type { SVGShape } from '../types';

interface HandleResizeArgs {
  shapes: SVGShape[];
  dx: number;
  dy: number;
  x: number;
  y: number;
  resizeHandle: string | null;
  selectedShape: string | null;
  draggingCornerHandle: { shapeId: string; handleType: string; startCornerRadius: number } | null;
  cornerHandlesRef: React.MutableRefObject<Map<string, SVGRectElement[]>>;
  setShapesState: (updater: (prev: SVGShape[]) => SVGShape[]) => void;
  setDraggingCornerHandle: React.Dispatch<React.SetStateAction<{ shapeId: string; handleType: string; startCornerRadius: number } | null>>;
  setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  updateShapeSize: (shape: SVGShape, handle: string, dx: number, dy: number) => void;
  refreshResizeHandles: (shape: SVGShape) => void;
  showCornerHandles: (shape: SVGShape) => void;
  updateConnectionLine: (connLine: SVGShape, shapeId: string, shapeList?: SVGShape[]) => void;
}

export const handleResizeMove = ({
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
}: HandleResizeArgs) => {
  if (draggingCornerHandle) {
    const shape = shapes.find(s => s.id === draggingCornerHandle.shapeId);
    if (shape && shape.type === 'roundedRect') {
      const maxRadius = Math.min((shape.data.width || 0), (shape.data.height || 0)) / 2;
      const currentCornerRadius = shape.data.cornerRadius || 0;
      const newCornerRadius = Math.max(0, Math.min(maxRadius, currentCornerRadius + dx));
      const currentX = x;

      shape.element.setAttribute('rx', String(newCornerRadius));
      shape.element.setAttribute('ry', String(newCornerRadius));

      const handles = cornerHandlesRef.current.get(shape.id);
      const handleEl = handles?.find(h => h.getAttribute('data-corner-handle') === draggingCornerHandle.handleType);
      if (handleEl) {
        const size = Number(handleEl.getAttribute('width')) || 10;
        const currentY = Number(handleEl.getAttribute('y')) || 0;
        handleEl.setAttribute('x', String(currentX - size / 2));
        handleEl.setAttribute('y', String(currentY));
      }

      const updatedShape = {
        ...shape,
        data: {
          ...shape.data,
          cornerRadius: newCornerRadius
        }
      };

      const nextShapes = shapes.map(s => s.id === shape.id ? updatedShape : s);
      setShapesState(() => nextShapes);

      setDraggingCornerHandle({
        ...draggingCornerHandle,
        startCornerRadius: newCornerRadius
      });

      setDragStart({ x, y });
      setTimeout(() => {
        showCornerHandles(updatedShape);
      }, 0);
      return true;
    }
  } else if (selectedShape && resizeHandle) {
    const shape = shapes.find(s => s.id === selectedShape);
    if (shape) {
      updateShapeSize(shape, resizeHandle, dx, dy);
      refreshResizeHandles(shape);

      if (shape.type === 'roundedRect') {
        showCornerHandles(shape);
      }
    }

    if (shape) {
      const nextShapes = shapes.map(s => s.id === shape.id ? { ...shape, data: { ...shape.data }, connections: shape.connections ? [...shape.connections] : undefined, element: shape.element } : s);
      shape.connections?.forEach(connId => {
        const connLine = nextShapes.find(s => s.id === connId);
        if (connLine && (connLine.type === 'line' || connLine.type === 'polyline' || connLine.type === 'connector')) {
          updateConnectionLine(connLine, shape.id, nextShapes);
        }
      });
      setShapesState(() => nextShapes);
    }
  }

  setDragStart({ x, y });
  return true;
};
